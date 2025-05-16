import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  ExpandLess,
  ExpandMore,
  AccessTime as AccessTimeIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';

const Sidebar = ({ 
  userRole = 'admin', // Default to admin if not provided
  actions = [], 
  profileData 
}) => {
  // State for expanded menus
  const [expandedMenus, setExpandedMenus] = useState({
    leave: false,
    system: false,
    project: false,
    time: false
  });

  // Toggle menu expansion
  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Common menu items that might appear in all dashboards
  const commonMenuItems = [
    { 
      text: "Profile", 
      icon: <PersonIcon />, 
      link: `/${userRole === 'admin' ? 'admin' : userRole === 'hr' ? 'hr' : 'user'}/profile`,
      visible: actions?.includes("VIEW_PROFILE"),
      roles: ['admin', 'user', 'hr']
    }
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    { 
      text: "Dashboard", 
      icon: <DashboardIcon />, 
      link: "/admin/dashboard",
      visible: actions?.includes("VIEW_ADMIN_DASHBOARD"),
      roles: ['admin']
    },
    { 
      text: "Employees", 
      icon: <PeopleIcon />, 
      link: "/admin/employees",
      visible: actions?.includes("MANAGE_EMPLOYEE"),
      roles: ['admin']
    },
    {
      text: "System",
      icon: <SettingsIcon />,
      menuKey: "system",
      visible: (
        actions?.includes("VIEW_USER_MANAGEMENT") || 
        actions?.includes("CREATE_ACTIONS") || 
        actions?.includes("CREATE_ROLE") ||
        actions?.includes("VIEW_LIST_ACTIONS") || 
        actions?.includes("VIEW_LIST_ROLES")
      ),
      roles: ['admin'],
      subItems: [
        { text: "User Management", link: "/admin/user-management", visible: actions?.includes("VIEW_USER_MANAGEMENT") },
        { text: "Actions", link: "/admin/create-action", visible: actions?.includes("CREATE_ACTIONS") },
        { text: "Roles", link: "/admin/create-role", visible: actions?.includes("CREATE_ROLE") },
        { text: "List Actions", link: "/admin/list-actions", visible: actions?.includes("VIEW_LIST_ACTIONS") },
        { text: "List Roles", link: "/admin/list-roles", visible: actions?.includes("VIEW_LIST_ROLES") },
      ].filter(item => item?.visible)
    },
    {
      text: "Projects",
      icon: <WorkIcon />,
      menuKey: "project",
      visible: (actions?.includes("MANAGE_PROJECT") || actions?.includes("MANAGE_TASK")),
      roles: ['admin'],
      subItems: [
        { text: "Projects", link: "/admin/projects", visible: actions?.includes("MANAGE_PROJECT") },
        { text: "Tasks", link: "/admin/projects/tasks", visible: actions?.includes("MANAGE_TASK") },
      ].filter(item => item?.visible)
    },
    { 
      text: "Timesheets", 
      icon: <AccessTimeIcon />, 
      link: "/admin/dashboard/timesheets",
      visible: actions?.includes("MANAGE_TIMESHEET"),
      roles: ['admin']
    },
    {
      text: "Leave Management",
      icon: <CalendarTodayIcon />,
      menuKey: "leave",
      visible: (
        actions?.includes("MANAGE_LEAVE") || 
        actions?.includes("MANAGE_LEAVE_TYPE") || 
        actions?.includes("MANAGE_LEAVE_BALANCE") || 
        actions?.includes("MANAGE_HOLIDAY")
      ),
      roles: ['admin'],
      subItems: [
        { text: "Leaves", link: "/admin/leaves", visible: actions?.includes("MANAGE_LEAVE") },
        { text: "Leave Type", link: "/admin/leaves-type", visible: actions?.includes("MANAGE_LEAVE_TYPE") },
        { text: "Leave Balance", link: "/admin/leave-balance", visible: actions?.includes("MANAGE_LEAVE_BALANCE") },
        { text: "Holiday", link: "/admin/holiday", visible: actions?.includes("MANAGE_HOLIDAY") },
      ].filter(item => item?.visible)
    },
    { 
      text: "Attendance", 
      icon: <CheckCircleIcon />, 
      link: "/admin/attendance",
      visible: actions?.includes("MANAGE_ATTENDANCE"),
      roles: ['admin']
    }
  ];


  // HR-specific menu items (UPDATED WITH /hr/ ROUTES)
  const hrMenuItems = [
    { 
      text: "HR Dashboard", 
      icon: <DashboardIcon />, 
      link: "/hr/dashboard",
      visible: actions?.includes("VIEW_HR_DASHBOARD"),
      roles: ['hr']
    },
    { 
      text: "Employees", 
      icon: <PeopleIcon />, 
      link: "/hr/employees",
      visible: actions?.includes("MANAGE_EMPLOYEE"),
      roles: ['hr']
    },
    {
      text: "System",
      icon: <SettingsIcon />,
      menuKey: "system",
      visible: actions?.includes("VIEW_USER_MANAGEMENT"),
      roles: ['hr'],
      subItems: [
        { text: "User Management", link: "/hr/user-management", visible: actions?.includes("VIEW_USER_MANAGEMENT") },
      ].filter(item => item?.visible)
    },
    { 
      text: "Timesheets", 
      icon: <AccessTimeIcon />, 
      link: "/hr/timesheets",
      visible: actions?.includes("MANAGE_TIMESHEET"),
      roles: ['hr']
    },
    {
      text: "Leave Management",
      icon: <CalendarTodayIcon />,
      menuKey: "leave",
      visible: (
        actions?.includes("MANAGE_LEAVE") || 
        actions?.includes("MANAGE_LEAVE_TYPE") || 
        actions?.includes("MANAGE_LEAVE_BALANCE") || 
        actions?.includes("MANAGE_HOLIDAY")
      ),
      roles: ['hr'],
      subItems: [
        { text: "Leaves", link: "/hr/leaves", visible: actions?.includes("MANAGE_LEAVE") },
        { text: "Leave Type", link: "/hr/leaves-type", visible: actions?.includes("MANAGE_LEAVE_TYPE") },
        { text: "Leave Balance", link: "/hr/leave-balance", visible: actions?.includes("MANAGE_LEAVE_BALANCE") },
        { text: "Holiday", link: "/hr/holiday", visible: actions?.includes("MANAGE_HOLIDAY") },
      ].filter(item => item?.visible)
    },
    { 
      text: "Attendance", 
      icon: <CheckCircleIcon />, 
      link: "/hr/attendance",
      visible: actions?.includes("MANAGE_ATTENDANCE"),
      roles: ['hr']
    }
  ];

  // User-specific menu items (UPDATED WITH /user/ ROUTES)
  const userMenuItems = [
    { 
      text: "Home", 
      icon: <DashboardIcon />, 
      link: "/user/employee-dashboard",
      visible: actions?.includes("VIEW_USER_DASHBOARD"),
      roles: ['user']
    },
    {
      text: "Projects & Tasks",
      icon: <WorkIcon />,
      menuKey: "project",
      visible: true,
      roles: ['user'],
      subItems: [
        { text: "My Projects", link: "/user/myproject", visible: actions?.includes("VIEW_PROJECT") },
        { text: "My Tasks", link: "/user/mytask", visible: actions?.includes("VIEW_TASK") },
      ].filter(item => item?.visible)
    },
    {
      text: "Time & Management",
      icon: <AccessTimeIcon />,
      menuKey: "time",
      visible: true,
      roles: ['user'],
      subItems: [
        { text: "Timesheet", link: "/user/employee-dashboard/timesheet-detail", visible: actions?.includes("VIEW_TIMESHEET") },
        { text: "Attendance", link: "/user/employee-dashboard/attendence", visible: actions?.includes("VIEW_ATTENDANCE") },
      ].filter(item => item?.visible)
    },
    {
      text: "Leave Management",
      icon: <CalendarTodayIcon />,
      menuKey: "leave",
      visible: true,
      roles: ['user'],
      subItems: [
        { text: "Leave Request", link: "/user/leaves", visible: actions?.includes("VIEW_LEAVE") },
        { text: "Leave Balance", link: "/user/leave-balance", visible: actions?.includes("VIEW_LEAVE_BALANCE") },
        { text: "Holiday Calendar", link: "/user/holiday", visible: actions?.includes("VIEW_HOLIDAY") },
      ].filter(item => item?.visible)
    }
  ];

  // Combine all menu items based on user role
  const allMenuItems = [
    ...commonMenuItems,
    ...(userRole === 'admin' ? adminMenuItems : 
        userRole === 'hr' ? hrMenuItems : userMenuItems)
  ].filter(item => item?.visible && item?.roles?.includes(userRole));

  // Get gender icon for profile
  const genderIcon = profileData?.personal?.gender?.toLowerCase() === 'male'
    ? <MaleIcon fontSize="small" color="primary" />
    : <FemaleIcon fontSize="small" color="secondary" />;

  return (
    <Box sx={{
      width: 250,
      bgcolor: "#1e293b",
      color: "white",
      p: 2,
      overflowY: 'auto',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Profile Section */}
      {profileData && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3, 
          p: 2,
          bgcolor: '#334155',
          borderRadius: 1
        }}>
          <Avatar sx={{ bgcolor: 'background.paper' }}>
            {genderIcon}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {profileData?.personal?.firstName || 'User'} {profileData?.personal?.lastName || ''}
            </Typography>
            <Typography variant="caption">
              {userRole === 'admin' ? 'Administrator' : 
               userRole === 'hr' ? 'HR Manager' : 'Employee'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Menu Items */}
      <List sx={{ flexGrow: 1 }}>
        {allMenuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                component={item.subItems ? "button" : Link}
                to={item.subItems ? undefined : item.link}
                onClick={item.subItems ? () => toggleMenu(item.menuKey) : undefined}
                sx={{
                  "&:hover": { bgcolor: "#64748b" },
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.95rem' }}
                />
                {item.subItems && (
                  expandedMenus[item.menuKey] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.subItems && item.subItems.length > 0 && (
              <Collapse
                in={expandedMenus[item.menuKey]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      component={Link}
                      to={subItem.link}
                      sx={{
                        pl: 4,
                        "&:hover": { bgcolor: "#475569" },
                        borderRadius: 1,
                        mb: 0.5
                      }}
                    >
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;