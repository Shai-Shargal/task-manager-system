/**
 * EmployeeColorLabel — avatar dot + colored name badge.
 */

import { employeeTheme } from '../utils/employeeColor.js';

function EmployeeColorLabel({ name, colorHex }) {
  const theme = employeeTheme(colorHex);

  return (
    <span className="employee-name-cell">
      <span className="employee-color-dot" style={theme.dotStyle} aria-hidden />
      <span className="employee-color-badge" style={theme.badgeStyle}>
        {name}
      </span>
    </span>
  );
}

export default EmployeeColorLabel;
