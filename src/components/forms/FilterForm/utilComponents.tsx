import * as React from 'react';
import { Dropdown, DropdownToggle } from 'reactstrap';
import './util.css';

interface DropDownRendererProps {
  renderMenu: () => React.ReactNode;
  renderToggle: () => React.ReactNode;
}

const defaultDropDownRenderProps = {
  renderMenu: () => null,
  renderToggle: () => null,
};

export const DropDownRenderer = (props: DropDownRendererProps = defaultDropDownRenderProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <Dropdown
      size="sm"
      className="mr-3 drop-down-container"
      style={{ display: 'inline' }}
      isOpen={isOpen}
      toggle={toggle}
    >
      <DropdownToggle outline={true} className="filter-bar-btns">
        {props.renderToggle()}
      </DropdownToggle>
      {props.renderMenu()}
    </Dropdown>
  );
};
