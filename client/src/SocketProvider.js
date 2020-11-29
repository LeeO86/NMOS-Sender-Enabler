import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState();
  const [nodes, setNodes] = useState([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('nodes', (nodes) => setNodes(nodes));
    newSocket.on('running', (runState) => setRunning(runState));
    newSocket.on('prevLogs', (logs) => setLogs(logs));
    newSocket.on('logEntry', (logEntry) =>
      setLogs((prevLogs) => [...prevLogs, logEntry])
    );
    newSocket.on('addNodeRes', (res) => {
      if (!res.success) alert(res.error);
    });
    newSocket.on('removeNodeRes', (res) => {
      if (!res.success) alert(res.error);
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, nodes, running, logs }}>
      {children}
    </SocketContext.Provider>
  );
}
