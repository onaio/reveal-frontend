/** simple bootstrap accordion abstraction */
import React from 'react';

/** minimal type for a renderProp */
export type RenderProp = () => React.ReactNode;

/** describes a single pane in the accordion */
export interface Accordion {
  accordionBody: RenderProp;
  headerText: string;
  cardHeaderId: string;
  collapsibleBodyId: string;
}

/** accordions props */
export interface AccordionProps {
  accordionId: string;
  accordions: Accordion[];
}

/** bootstrap powered accordion component */
export const Accordion = (props: AccordionProps) => {
  const { accordions, accordionId } = props;

  return (
    <div className="accordion" id={accordionId}>
      {accordions.map((accordion, index) => {
        const { accordionBody, headerText, cardHeaderId, collapsibleBodyId } = accordion;

        return (
          <div className="card" key={`${accordionId}-${index}`}>
            <div className="card-header" id={`${cardHeaderId}`}>
              <h2 className="mb-0">
                <button
                  className="btn btn-link btn-block text-left collapsed"
                  type="button"
                  data-toggle="collapse"
                  data-target={`#${collapsibleBodyId}`}
                  aria-expanded="false"
                  aria-controls={`${collapsibleBodyId}`}
                >
                  {headerText}
                </button>
              </h2>
            </div>
            <div
              id={`${collapsibleBodyId}`}
              className="collapse"
              aria-labelledby={`${cardHeaderId}`}
              data-parent={`#${accordionId}`}
            >
              <div className="card-body">{accordionBody()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
