import React, { Fragment } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Gear, Tools } from 'react-bootstrap-icons';

function Header(props) {
  return (
    <Fragment>
      <Navbar bg="dark" variant="dark" className="justify-content-between mb-3">
        <Navbar.Brand>
          <Tools size="1.6rem" className="mb-1 mr-3" /> NMOS Sender Enabler
        </Navbar.Brand>
        <Button variant="outline-light" {...props}>
          <Gear size="1.6rem" />
        </Button>
      </Navbar>
    </Fragment>
  );
}

export default Header;
