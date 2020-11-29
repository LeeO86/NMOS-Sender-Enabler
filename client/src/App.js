import React, { useState } from 'react';
import './App.css';
import Header from './header';
import Settings from './settingsModal';

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { SocketProvider } from './SocketProvider';
import NodesTable from './NodesTable';
import LogsArea from './LogsArea';

function App() {
  const [modal, setModal] = useState(false);

  const openSettings = (state) => {
    setModal(state);
  };

  return (
    <SocketProvider>
      <div className="App bg-secondary">
        <header className="App-header">
          <Header onClick={() => openSettings(true)} />
        </header>
        <main>
          <Container>
            <Card>
              <Card.Body>
                <NodesTable />
                <LogsArea />
              </Card.Body>
            </Card>
          </Container>
        </main>
        <Settings show={modal} onHide={() => setModal(false)} />
      </div>
    </SocketProvider>
  );
}

export default App;
