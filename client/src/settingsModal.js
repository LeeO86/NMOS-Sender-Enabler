import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {
  GearFill,
  FileEarmarkX,
  FileEarmarkCheck,
} from 'react-bootstrap-icons';
import { useSocket } from './SocketProvider';

function Settings(props) {
  const { socket, nodes } = useSocket();
  const selectRef = useRef();
  const nameRef = useRef();
  const urlRef = useRef();

  function saveNode() {
    let oldUrl;
    let index = selectRef.current.value;
    if (index !== '-1') oldUrl = nodes[index].url;
    else oldUrl = index;
    let name = nameRef.current.value;
    let url = urlRef.current.value;
    socket.emit('addNode', { oldUrl, name, url });
    props.onHide();
  }

  function deleteNode() {
    let index = selectRef.current.value;
    if (index !== '-1') {
      let node = nodes[index];
      socket.emit('removeNode', { url: node.url });
      props.onHide();
    }
  }

  function onSelectNode() {
    let index = selectRef.current.value;
    if (index !== '-1') {
      let node = nodes[index];
      if (node) {
        nameRef.current.value = node.name;
        urlRef.current.value = node.url;
      }
    } else {
      nameRef.current.value = '';
      urlRef.current.value = '';
    }
  }

  return (
    <Modal {...props} size="lg" aria-labelledby="modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title-lg">
          <GearFill size="1.6rem" className="mr-1 mb-1" /> Node Settings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="settings.Select">
            <Form.Label>Select Node</Form.Label>
            <Form.Control ref={selectRef} onChange={onSelectNode} as="select">
              <option key={-1} value={-1}>
                New Node
              </option>
              {nodes.map((node, index) => (
                <option key={index} value={index}>
                  {node.name} ({node.url})
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="settings.Name">
            <Form.Label>Node Name</Form.Label>
            <Form.Control ref={nameRef} type="text" placeholder="Node" />
          </Form.Group>
          <Form.Group controlId="settings.URL">
            <Form.Label>Node URL</Form.Label>
            <Form.Control
              ref={urlRef}
              type="url"
              placeholder="http://node.url:port"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={deleteNode} variant="danger">
          <FileEarmarkX size="1.5rem" className="mr-1 pb-1" />
          Delete Node
        </Button>
        <Button onClick={saveNode} variant="success">
          <FileEarmarkCheck size="1.5rem" className="mr-1 pb-1" />
          Save Node
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Settings;
