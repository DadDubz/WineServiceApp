# WineServiceApp

Application for wine service expo and wine inventory

This repository contains a very small demo of a restaurant wine service application.  
Open `index.html` in your browser to try the sample interface.  
It includes a basic login screen and simple navigation tabs for service, inventory and reports.

## Overview

This repository contains a demo front-end for managing restaurant wine service.
Open `index.html` in a browser to try it out. Use `demo`/`demo` for credentials.

The interface includes:

- **Service** tab for managing active tables and their courses
- **Wine List** tab showing available wines
- **Inventory** tab for stock levels and adjustments
- **Reports** tab with simple demo reports

Role permissions control which tabs and features are available. Everything is
implemented with plain HTML, Tailwind CSS and vanilla JavaScript so no build
step is required.

## Backend server

A tiny Python server is included to provide demo API endpoints for login, table
management, wine inventory, and reports. It keeps all data in memory so nothing
is persisted between runs.

Run the server with:

```bash
python3 server.py
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. The
front-end will make requests to the API hosted on the same port.
