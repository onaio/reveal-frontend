import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from 'reactstrap';
import { WEBSITE_NAME } from '../../constants';
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
                <NavLink href="#">Home</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">IRS</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">Focus Investigation</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">Users</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">About</NavLink>
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
        <Breadcrumb className="reveal-breadcrumb">
          <BreadcrumbItem>
            <a href="#">Home</a>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <a href="#">Library</a>
          </BreadcrumbItem>
          <BreadcrumbItem active={true}>Data</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }

  private toggle() {
    this.setState({ isOpen: !this.state.isOpen });
  }
}

export default Header;
