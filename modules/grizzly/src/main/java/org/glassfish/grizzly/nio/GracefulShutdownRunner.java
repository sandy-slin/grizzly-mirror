/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2013 Oracle and/or its affiliates. All rights reserved.
 *
 * The contents of this file are subject to the terms of either the GNU
 * General Public License Version 2 only ("GPL") or the Common Development
 * and Distribution License("CDDL") (collectively, the "License").  You
 * may not use this file except in compliance with the License.  You can
 * obtain a copy of the License at
 * https://glassfish.dev.java.net/public/CDDL+GPL_1_1.html
 * or packager/legal/LICENSE.txt.  See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * When distributing the software, include this License Header Notice in each
 * file and include the License file at packager/legal/LICENSE.txt.
 *
 * GPL Classpath Exception:
 * Oracle designates this particular file as subject to the "Classpath"
 * exception as provided by Oracle in the GPL Version 2 section of the License
 * file that accompanied this code.
 *
 * Modifications:
 * If applicable, add the following below the License Header, with the fields
 * enclosed by brackets [] replaced by your own identifying information:
 * "Portions Copyright [year] [name of copyright owner]"
 *
 * Contributor(s):
 * If you wish your version of this file to be governed by only the CDDL or
 * only the GPL Version 2, indicate your decision by adding "[Contributor]
 * elects to include this software in this distribution under the [CDDL or GPL
 * Version 2] license."  If you don't indicate a single choice of license, a
 * recipient has the option to distribute your version of this file under
 * either the CDDL, the GPL Version 2 or to extend the choice of license to
 * its licensees as provided above.  However, if you add GPL Version 2 code
 * and therefore, elected the GPL Version 2 license, then the option applies
 * only if the new code is made subject to such option by the copyright
 * holder.
 */

package org.glassfish.grizzly.nio;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.glassfish.grizzly.GracefulShutdownListener;
import org.glassfish.grizzly.Grizzly;
import org.glassfish.grizzly.ShutdownContext;
import org.glassfish.grizzly.Transport;

class GracefulShutdownRunner implements Runnable {
    private static final Logger LOGGER = Grizzly.logger(GracefulShutdownRunner.class);

    private final NIOTransport transport;
    private final Set<GracefulShutdownListener> shutdownListeners;
    private final ExecutorService shutdownService;
    private final long gracePeriod;
    private final TimeUnit timeUnit;

    // -------------------------------------------------------- Constructors
    GracefulShutdownRunner(final NIOTransport transport,
            final Set<GracefulShutdownListener> shutdownListeners,
            final ExecutorService shutdownService,
            final long gracePeriod, final TimeUnit timeUnit) {
        this.transport = transport;
        this.shutdownListeners = shutdownListeners;
        this.shutdownService = shutdownService;
        this.gracePeriod = gracePeriod;
        this.timeUnit = timeUnit;
    }

    // ----------------------------------------------- Methods from Runnable
    @Override
    public void run() {
        final int listenerCount = shutdownListeners.size();
        final CountDownLatch shutdownLatch = new CountDownLatch(listenerCount);

        // If there there is no timeout, invoke the listeners in the
        // same thread otherwise use one additional thread to invoke them.
        final Map<ShutdownContext,GracefulShutdownListener> contexts =
                new HashMap<ShutdownContext,GracefulShutdownListener>(listenerCount);
        if (gracePeriod <= 0) {
            for (final GracefulShutdownListener l : shutdownListeners) {
                final ShutdownContext ctx = createContext(contexts, l, shutdownLatch);
                l.shutdownRequested(ctx);
            }
        } else {
            shutdownService.execute(new Runnable() {
                @Override
                public void run() {
                    for (final GracefulShutdownListener l : shutdownListeners) {
                        final ShutdownContext ctx = createContext(contexts, l, shutdownLatch);
                        l.shutdownRequested(ctx);
                    }
                }
            });
        }
        try {
            if (gracePeriod <= 0) {
                shutdownLatch.await();
            } else {
                if (LOGGER.isLoggable(Level.WARNING)) {
                    LOGGER.log(Level.WARNING,
                            "Shutting down transport {0} in {1} {2}.",
                            new Object[]{transport.getName() + '[' + Integer.toHexString(hashCode()) + ']',
                                gracePeriod, timeUnit});
                }
                final boolean result = shutdownLatch.await(gracePeriod, timeUnit);
                if (!result) {
                    if (LOGGER.isLoggable(Level.WARNING)) {
                        LOGGER.log(Level.WARNING,
                                "Shutdown grace period exceeded.  Terminating transport {0}.",
                                transport.getName() + '[' + Integer.toHexString(hashCode()) + ']');
                    }
                    if (!contexts.isEmpty()) {
                        for (GracefulShutdownListener l : contexts.values()) {
                            l.shutdownForced();
                        }
                    }
                }
            }
        } catch (InterruptedException ie) {
            if (LOGGER.isLoggable(Level.WARNING)) {
                LOGGER.warning("Primary shutdown thread interrupted.  Forcing transport termination.");
            }
            if (!contexts.isEmpty()) {
                for (GracefulShutdownListener l : contexts.values()) {
                    l.shutdownForced();
                }
            }
        } finally {
            final Lock lock = transport.getState().getStateLocker().writeLock();
            lock.lock();
            
            try {
                // Make sure the transport is still expecting to be shutdown
                if (transport.shutdownService == this.shutdownService) {
                    transport.finalizeShutdown();
                }
            } finally {
                lock.unlock();
            }
        }
    }

    private ShutdownContext createContext(final Map<ShutdownContext,GracefulShutdownListener> contexts,
                                          final GracefulShutdownListener listener,
                                          final CountDownLatch shutdownLatch) {
        final ShutdownContext ctx = new ShutdownContext() {
            boolean isNotified;

            @Override
            public Transport getTransport() {
                return transport;
            }

            @Override
            public synchronized void ready() {
                if (!isNotified) {
                    isNotified = true;
                    contexts.remove(this);
                    shutdownLatch.countDown();
                }
            }
        };
        contexts.put(ctx, listener);
        return ctx;
    }

} // END GracefulShutdownRunner
