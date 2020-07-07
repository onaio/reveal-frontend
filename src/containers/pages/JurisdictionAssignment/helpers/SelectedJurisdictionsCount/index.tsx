/** Props for SelectedJurisdictionsCount  */
export interface SelectedJurisdictionsCountProps {
  jurisdictions: string[] /** array of jurisdictions */;
}

/** default props for SelectedJurisdictionsCount */
const defaultProps: SelectedJurisdictionsCountProps = {
  jurisdictions: [],
};

/**
 * SelectedJurisdictionsCount
 *
 * This component displays the count of the selected jurisdictions
 *
 * @param props - the props!
 */
const SelectedJurisdictionsCount = (props: SelectedJurisdictionsCountProps) => {
  const { jurisdictions } = props;

  if (!jurisdictions || jurisdictions.length < 1) {
    return null;
  }

  return 0;
};

SelectedJurisdictionsCount.defaultProps = defaultProps;

export { SelectedJurisdictionsCount };
