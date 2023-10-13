import React from 'react'
import {Fragment} from 'react'
import {OverlayTrigger, Popover} from 'react-bootstrap'
import {CustomTooltipType} from '../../types/customtooltip'

export const CustomTooltip = ({children, placement, tooltipId, tooltipClasses, tooltipText, tooltipTextClasses, delay}: CustomTooltipType) => {
  if (typeof tooltipText !== 'string') {
    const newTooltipText = React.cloneElement(tooltipText, {
      className: ' bg-secondary text-wrap p-1 px-2 '
    })
    tooltipText = newTooltipText
  }

  return (
    <Fragment>
      <OverlayTrigger
        placement={placement}
        overlay={
          <Popover id={`popover-positioned-${placement}`}>
            <Popover.Body
              id={!tooltipId ? `${tooltipText}Tooltip` : tooltipId}
              style={{minWidth: 'fit-content'}}
              className={'text-wrap p-1 px-2 bg-secondary w-100' + tooltipClasses}
            >
              {typeof tooltipText === 'string' ? <span className={'text-wrap p-1 px-2 bg-secondary ' + {tooltipTextClasses}}>{tooltipText}</span> : tooltipText}
            </Popover.Body>
          </Popover>
        }
        delay={delay}
      >
        {children}
      </OverlayTrigger>
    </Fragment>
  )
}
