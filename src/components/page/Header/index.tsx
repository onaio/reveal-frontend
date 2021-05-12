import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@onaio/session-reducer';
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
import {
  BACKEND_ACTIVE,
  CLIENT_LABEL,
  ENABLE_ASSIGN,
  ENABLE_CONFIG_FORM,
  ENABLE_DYNAMIC_MDA,
  ENABLE_FI,
  ENABLE_IRS,
  ENABLE_IRS_LITE,
  ENABLE_IRS_MOPUP_REPORTING,
  ENABLE_IRS_PERFORMANCE_REPORT,
  ENABLE_JURISDICTION_METADATA_UPLOAD,
  ENABLE_MDA_LITE,
  ENABLE_MDA_POINT,
  ENABLE_PLANNING,
  ENABLE_POPULATION_SERVER_SETTINGS,
  ENABLE_PRACTITIONERS,
  ENABLE_SMC,
  ENABLE_STRUCTURE_METADATA_UPLOAD,
  ENABLE_TEAMS,
  ENABLE_USERS,
  NAVBAR_BRAND_IMG_SRC,
  WEBSITE_NAME,
} from '../../../configs/env';
import { DISPLAYED_PLAN_TYPES } from '../../../configs/env';
import {
  ADMIN,
  ASSIGN,
  CLIENTS_TITLE,
  FOCUS_INVESTIGATION,
  FORM_DRAFT_FILES,
  HOME,
  IRS_LITE_REPORTING_TITLE,
  IRS_PERFORMANCE_REPORTING_TITLE,
  IRS_REPORTING_TITLE,
  JSON_VALIDATORS,
  JURISDICTION_METADATA,
  LOGIN,
  MANIFEST_RELEASES,
  MDA_LITE_REPORTING_TITLE,
  MDA_POINT_REPORTING_TITLE,
  MDA_REPORTING_TITLE,
  MONITOR,
  MOP_UP_REPORTING_TITLE,
  ORGANIZATIONS_LABEL,
  PLAN_TITLE,
  PLANNING_PAGE_TITLE,
  PLANS,
  PRACTITIONERS,
  SERVER_SETTINGS,
  SIGN_OUT,
  SMC_REPORTING_TITLE,
  STRUCTURE_METADATA,
  STUDENTS_TITLE,
} from '../../../configs/lang';
import {
  ASSIGN_PLAN_URL,
  BACKEND_LOGIN_URL,
  CLIENTS_LIST_URL,
  EDIT_SERVER_SETTINGS_URL,
  FI_URL,
  IRS_MOP_UP_REPORT_URL,
  JSON_VALIDATORS_URL,
  JURISDICTION_METADATA_URL,
  LOGOUT_URL,
  MANIFEST_RELEASE_URL,
  ORGANIZATIONS_LIST_URL,
  PERFORMANCE_REPORT_IRS_PLAN_URL,
  PLAN_LIST_URL,
  PLANNING_VIEW_URL,
  PRACTITIONERS_LIST_URL,
  REACT_LOGIN_URL,
  REPORT_IRS_LITE_PLAN_URL,
  REPORT_IRS_PLAN_URL,
  REPORT_MDA_LITE_PLAN_URL,
  REPORT_MDA_PLAN_URL,
  REPORT_MDA_POINT_PLAN_URL,
  REPORT_SMC_PLAN_URL,
  STRUCTURE_METADATA_URL,
  VIEW_DRAFT_FILES_URL,
} from '../../../constants';
import './Header.css';

/** interface for Header state */
interface State {
  isOpen: boolean;
}

/** interface for HeaderProps */
export interface HeaderProps extends RouteComponentProps {
  authenticated: boolean;
  user: User;
}

/** default props for Header */
const defaultHeaderProps: Partial<HeaderProps> = {
  authenticated: false,
  user: {
    email: '',
    name: '',
    username: '',
  },
};

const APP_LOGIN_URL = BACKEND_ACTIVE ? BACKEND_LOGIN_URL : REACT_LOGIN_URL;
/** The Header component */
export class HeaderComponent extends React.Component<HeaderProps, State> {
  public static defaultProps = defaultHeaderProps;

  constructor(props: HeaderProps) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  public render() {
    const { authenticated, user } = this.props;
    const path = this.props.location.pathname;
    const enablePlansDropDown = DISPLAYED_PLAN_TYPES.length > 0;
    const enableAdminDropDown =
      ENABLE_TEAMS ||
      ENABLE_PRACTITIONERS ||
      ENABLE_USERS ||
      ENABLE_MDA_POINT ||
      ENABLE_CONFIG_FORM ||
      ENABLE_JURISDICTION_METADATA_UPLOAD ||
      ENABLE_STRUCTURE_METADATA_UPLOAD ||
      ENABLE_POPULATION_SERVER_SETTINGS;

    const enableMonitorDropDown =
      ENABLE_IRS ||
      ENABLE_FI ||
      ENABLE_DYNAMIC_MDA ||
      ENABLE_MDA_POINT ||
      ENABLE_IRS_PERFORMANCE_REPORT ||
      ENABLE_IRS_MOPUP_REPORTING ||
      ENABLE_IRS_LITE ||
      ENABLE_SMC ||
      ENABLE_MDA_LITE;

    return (
      <div>
        <Navbar light={true} expand="md">
          <nav className="navbar navbar-expand-md navbar-light header-logo-navbar">
            <Link to="/" className="navbar-brand">
              <img src={NAVBAR_BRAND_IMG_SRC} alt={WEBSITE_NAME} />
            </Link>
          </nav>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar={true}>
            <Nav className="mr-auto" navbar={true}>
              <NavItem>
                <NavLink
                  to="/"
                  className={path === '/' ? 'nav-link active' : 'nav-link'}
                  activeClassName="active"
                >
                  {HOME}
                </NavLink>
              </NavItem>

              {enablePlansDropDown && (
                <UncontrolledDropdown nav={true} inNavbar={true}>
                  <DropdownToggle nav={true} caret={true} className={'nav-link'}>
                    {PLAN_TITLE}
                  </DropdownToggle>
                  <DropdownMenu right={true}>
                    <DropdownItem>
                      <NavLink to={PLAN_LIST_URL} className="nav-link" activeClassName="active">
                        {PLANS}
                      </NavLink>
                    </DropdownItem>
                    {ENABLE_PLANNING && (
                      <DropdownItem>
                        <NavLink
                          to={PLANNING_VIEW_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {PLANNING_PAGE_TITLE}
                        </NavLink>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}

              {ENABLE_ASSIGN && (
                <NavItem>
                  <NavLink to={ASSIGN_PLAN_URL} className="nav-link" activeClassName="active">
                    {ASSIGN}
                  </NavLink>
                </NavItem>
              )}

              {enableMonitorDropDown && (
                <UncontrolledDropdown nav={true} inNavbar={true}>
                  <DropdownToggle
                    nav={true}
                    caret={true}
                    className={path === FI_URL ? 'nav-link active' : 'nav-link'}
                  >
                    {MONITOR}
                  </DropdownToggle>
                  <DropdownMenu right={true}>
                    {ENABLE_FI && (
                      <div>
                        <DropdownItem>
                          <NavLink to={FI_URL} className="nav-link" activeClassName="active">
                            {FOCUS_INVESTIGATION}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_IRS && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={REPORT_IRS_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {IRS_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_IRS_LITE && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={REPORT_IRS_LITE_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {IRS_LITE_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_IRS_PERFORMANCE_REPORT && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={PERFORMANCE_REPORT_IRS_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {IRS_PERFORMANCE_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_IRS_MOPUP_REPORTING && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={IRS_MOP_UP_REPORT_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {MOP_UP_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_MDA_POINT && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={REPORT_MDA_POINT_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {MDA_POINT_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}

                    {ENABLE_MDA_LITE && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={REPORT_MDA_LITE_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {MDA_LITE_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_DYNAMIC_MDA && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={REPORT_MDA_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {MDA_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_SMC && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={REPORT_SMC_PLAN_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {SMC_REPORTING_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}

              {enableAdminDropDown && (
                <UncontrolledDropdown nav={true} inNavbar={true}>
                  <DropdownToggle nav={true} caret={true} className={'nav-link'}>
                    {ADMIN}
                  </DropdownToggle>
                  <DropdownMenu right={true}>
                    {ENABLE_TEAMS && (
                      <DropdownItem>
                        <NavLink
                          to={`${ORGANIZATIONS_LIST_URL}`}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {ORGANIZATIONS_LABEL}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_PRACTITIONERS && (
                      <DropdownItem>
                        <NavLink
                          to={`${PRACTITIONERS_LIST_URL}`}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {PRACTITIONERS}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_MDA_POINT && (
                      <div>
                        <DropdownItem>
                          <NavLink
                            to={CLIENTS_LIST_URL}
                            className="nav-link"
                            activeClassName="active"
                          >
                            {CLIENT_LABEL === STUDENTS_TITLE ? STUDENTS_TITLE : CLIENTS_TITLE}
                          </NavLink>
                        </DropdownItem>
                      </div>
                    )}
                    {ENABLE_CONFIG_FORM && (
                      <DropdownItem>
                        <NavLink
                          to={MANIFEST_RELEASE_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {MANIFEST_RELEASES}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_CONFIG_FORM && (
                      <DropdownItem>
                        <NavLink
                          to={JSON_VALIDATORS_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {JSON_VALIDATORS}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_CONFIG_FORM && (
                      <DropdownItem>
                        <NavLink
                          to={VIEW_DRAFT_FILES_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {FORM_DRAFT_FILES}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_JURISDICTION_METADATA_UPLOAD && (
                      <DropdownItem>
                        <NavLink
                          to={JURISDICTION_METADATA_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {JURISDICTION_METADATA}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_STRUCTURE_METADATA_UPLOAD && (
                      <DropdownItem>
                        <NavLink
                          to={STRUCTURE_METADATA_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {STRUCTURE_METADATA}
                        </NavLink>
                      </DropdownItem>
                    )}
                    {ENABLE_POPULATION_SERVER_SETTINGS && (
                      <DropdownItem>
                        <NavLink
                          to={EDIT_SERVER_SETTINGS_URL}
                          className="nav-link"
                          activeClassName="active"
                        >
                          {SERVER_SETTINGS}
                        </NavLink>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
            <Nav className="ml-0" navbar={true}>
              {authenticated ? (
                <UncontrolledDropdown nav={true} inNavbar={true}>
                  <DropdownToggle nav={true} caret={true}>
                    <FontAwesomeIcon icon={['far', 'user']} /> {user.username}
                  </DropdownToggle>
                  <DropdownMenu right={true}>
                    <DropdownItem>
                      <NavLink to={LOGOUT_URL} className="nav-link" activeClassName="active">
                        {SIGN_OUT}
                      </NavLink>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              ) : (
                <NavLink to={APP_LOGIN_URL} className="nav-link" activeClassName="active">
                  {LOGIN}
                </NavLink>
              )}
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
