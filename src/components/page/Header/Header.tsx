// This component represents the header part of the web app
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  UncontrolledDropdown,
} from 'reactstrap';
import { WEBSITE_NAME } from '../../../constants';
import './Header.css';

interface State {
  isOpen: boolean;
}

class Header extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  public render() {
    return (
      <div>
        <Navbar color="light" light={true} expand="md">
          <NavbarBrand href="/">{WEBSITE_NAME}</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar={true}>
            <Nav className="mr-auto" navbar={true}>
              <NavItem>
                <NavLink to="/" className="nav-link" activeClassName="active">
                  Home
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/irs" className="nav-link" activeClassName="active">
                  IRS
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/404" className="nav-link" activeClassName="active">
                  Focus Investigation
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/404" className="nav-link" activeClassName="active">
                  Users
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/404" className="nav-link" activeClassName="active">
                  About
                </NavLink>
              </NavItem>
            </Nav>
            <Nav className="ml-0" navbar={true}>
              <UncontrolledDropdown nav={true} inNavbar={true}>
                <DropdownToggle nav={true} caret={true}>
                  <FontAwesomeIcon icon={['far', 'user']} /> Roger
                </DropdownToggle>
                <DropdownMenu right={true}>
                  <DropdownItem>Sign Out</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }

  private toggle() {
    this.setState({ isOpen: !this.state.isOpen });
  }
}

export default Header;
