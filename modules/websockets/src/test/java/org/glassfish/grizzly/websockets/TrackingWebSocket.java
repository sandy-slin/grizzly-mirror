/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2010-2013 Oracle and/or its affiliates. All rights reserved.
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

package org.glassfish.grizzly.websockets;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.glassfish.grizzly.GrizzlyFuture;
import org.glassfish.grizzly.utils.DataStructures;

public class TrackingWebSocket extends WebSocketClient {
    final Set<String> sent = Collections.<String>newSetFromMap(
            DataStructures.<String, Boolean>getConcurrentMap());
    
    private final CountDownLatch received;
    private String name;

    public TrackingWebSocket(String address, Version version, int count, WebSocketListener... listeners)
        throws IOException, URISyntaxException {
        this(address, null, version, count, listeners);
    }

    public TrackingWebSocket(String address, String name, Version version, int count, WebSocketListener... listeners)
        throws IOException, URISyntaxException {
        super(address, version, listeners);
        this.name = name;
        received = new CountDownLatch(count);
    }

    @Override
    public GrizzlyFuture<DataFrame> send(String data) {
        sent.add(data);
        return super.send(data);
    }

    @Override
    public void onMessage(String message) {
        super.onMessage(message);
        if (sent.remove(message)) {
            received.countDown();
        }
    }

    @Override
    public void onConnect() {
        super.onConnect();
    }

    public boolean waitOnMessages() throws InterruptedException {
        return received.await(WebSocketEngine.DEFAULT_TIMEOUT*10, TimeUnit.SECONDS);
    }

    public String getName() {
        return name;
    }

    public CountDownLatch getReceived() {
        return received;
    }
    
    @Override
    protected void buildTransport() {
        super.buildTransport();
        transport.getAsyncQueueIO().getWriter().setMaxPendingBytesPerConnection(-1);
    }
}
