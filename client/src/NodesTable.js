import React from 'react';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Play } from 'react-bootstrap-icons';
import { useSocket } from './SocketProvider';

export default function NodesTable() {
  const { socket, nodes, running } = useSocket();

  function runEnableRoutine() {
    if (socket == null) return;
    socket.emit('run', true);
  }

  return (
    <>
      <div className="row align-items-center mb-3">
        <h3 className="col mb-0">Nodes</h3>
        <Button
          onClick={runEnableRoutine}
          disabled={running ? 'true' : ''}
          className="col"
        >
          <div className="row align-items-center justify-content-center">
            <Play size="1.625rem" className="mr-1" />
            <div>Enable all Senders</div>
          </div>
        </Button>
      </div>
      <Table>
        <tbody className="border-bottom">
          {nodes.map((node) => (
            <tr key={node.url}>
              <td className="align-middle fit">
                <Badge
                  pill
                  variant={node.reachable ? 'success' : 'danger'}
                  className="reachBadge mt-2"
                >
                  {' '}
                </Badge>
              </td>
              <td className="">
                <p className="mb-0 ">{node.name}</p>
                <small className="text-muted">{node.url}</small>
              </td>
              <td className="fit align-middle">
                <Badge variant="danger" className="float-right">
                  {node.error
                    ? 'some Error occured!\nCheck Logs...'
                    : node.reachable
                    ? ''
                    : 'Node not reachable'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
