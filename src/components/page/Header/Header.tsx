// This component represents the header part of the web app
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link, NavLink } from 'react-router-dom';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  UncontrolledDropdown,
} from 'reactstrap';
import logo from '../../../assets/images/logo.png';
import {
  ENABLE_FI,
  ENABLE_IRS,
  FI_HISTORICAL_URL,
  FI_URL,
  IRS_URL,
  WEBSITE_NAME,
} from '../../../constants';
import './Header.css';

interface State {
  isOpen: boolean;
}

class HeaderComponent extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  public render() {
    const path = this.props.location.pathname;
    return (
      <div>
        <Navbar color="light" light={true} expand="md">
          <nav className="navbar navbar-expand-md navbar-light bg-light">
            <Link to="/" className="navbar-brand">
              <img src={logo} alt={WEBSITE_NAME} />
            </Link>
          </nav>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar={true}>
            <Nav className="mr-auto" navbar={true}>
              <NavItem>
                <NavLink to="/" className="nav-link" activeClassName="active">
                  Home
                </NavLink>
              </NavItem>
              {ENABLE_IRS && (
                <NavItem>
                  <NavLink to={IRS_URL} className="nav-link" activeClassName="active">
                    IRS
                  </NavLink>
                </NavItem>
              )}
              {ENABLE_FI && (
                <UncontrolledDropdown nav={true} inNavbar={true}>
                  <DropdownToggle
                    nav={true}
                    caret={true}
                    className={
                      path === FI_URL || path === FI_HISTORICAL_URL ? 'nav-link active' : 'nav-link'
                    }
                  >
                    Focus Investigation
                  </DropdownToggle>
                  <DropdownMenu right={true}>
                    <DropdownItem>
                      <NavLink to={FI_URL} className="nav-link" activeClassName="active">
                        Active
                      </NavLink>
                    </DropdownItem>
                    <DropdownItem>
                      <NavLink to={FI_HISTORICAL_URL} className="nav-link" activeClassName="active">
                        Historical
                      </NavLink>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
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

const Header = withRouter(HeaderComponent);

export default Header;
