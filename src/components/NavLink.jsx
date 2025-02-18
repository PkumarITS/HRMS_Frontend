import { NavLink } from "react-router-dom";

<NavLink
  to="/dashboard"
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
  <i className="fs-4 bi-house-door ms-2"></i>
  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
</NavLink>
