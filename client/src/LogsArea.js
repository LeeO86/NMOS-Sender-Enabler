import React, { useRef, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useSocket } from './SocketProvider';

export default function LogsArea() {
  const { logs } = useSocket();
  const textarea = useRef();

  useEffect(() => {
    textarea.current.value = logs.join('\n');
    textarea.current.scrollTop = textarea.current.scrollHeight;
  }, [logs]);
  return (
    <div>
      <h3>Logs</h3>
      <Form>
        <Form.Group controlId="logs.form">
          <Form.Control
            ref={textarea}
            as="textarea"
            className="logsArea bg-white text-monospace"
            readOnly
          />
        </Form.Group>
      </Form>
    </div>
  );
}
