/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2009-2011 Oracle and/or its affiliates. All rights reserved.
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
package org.glassfish.grizzly.strategies;

import java.io.IOException;
import org.glassfish.grizzly.Connection;
import org.glassfish.grizzly.Grizzly;
import org.glassfish.grizzly.IOEvent;
import org.glassfish.grizzly.IOEventProcessingHandler;
import org.glassfish.grizzly.Processor;
import java.util.logging.Logger;

/**
 * {@link org.glassfish.grizzly.IOStrategy}, which executes {@link Processor}s in worker thread.
 *
 * @author Alexey Stashok
 */
public final class WorkerThreadIOStrategy extends AbstractIOStrategy {

    private static final WorkerThreadIOStrategy INSTANCE = new WorkerThreadIOStrategy();

    private static final Logger logger = Grizzly.logger(WorkerThreadIOStrategy.class);


    // ------------------------------------------------------------ Constructors


    private WorkerThreadIOStrategy() { }


    // ---------------------------------------------------------- Public Methods


    public static WorkerThreadIOStrategy getInstance() {
        return INSTANCE;
    }


    // ------------------------------------------------- Methods from IOStrategy


    @Override
    public boolean executeIoEvent(final Connection connection,
            final IOEvent ioEvent, final boolean isIoEventEnabled)
            throws IOException {

        final boolean isReadOrWriteEvent = isReadWrite(ioEvent);

        final IOEventProcessingHandler pp;
        if (isReadOrWriteEvent) {
            if (isIoEventEnabled) {
                connection.disableIOEvent(ioEvent);
            }
            
            pp = ENABLE_INTEREST_PROCESSING_HANDLER;
        } else {
            pp = null;
        }

        if (isExecuteInWorkerThread(ioEvent)) {
            getWorkerThreadPool(connection).execute(
                    new WorkerThreadRunnable(connection, ioEvent, pp));
        } else {
            run0(connection, ioEvent, pp);
        }

        return true;
    }


    // --------------------------------------------------------- Private Methods


    private static void run0(final Connection connection,
                             final IOEvent ioEvent,
                             final IOEventProcessingHandler processingHandler) {

        fireIOEvent(connection, ioEvent, processingHandler, logger);

    }
    
    private static final class WorkerThreadRunnable implements Runnable {
        final Connection connection;
        final IOEvent ioEvent;
        final IOEventProcessingHandler processingHandler;
        
        private WorkerThreadRunnable(final Connection connection,
                final IOEvent ioEvent,
                final IOEventProcessingHandler processingHandler) {
            this.connection = connection;
            this.ioEvent = ioEvent;
            this.processingHandler = processingHandler;
            
        }

        @Override
        public void run() {
            run0(connection, ioEvent, processingHandler);
        }        
    }

}
