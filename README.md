# WineServiceApp

This repository contains a demo front-end for managing restaurant wine service.
Start the included Python server and browse to `http://localhost:8000` to try the demo. Use `demo`/`demo` for credentials.

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

Then open [http://localhost:8000](http://localhost:8000) in your browser.
The interface now fetches tables and wines from the running API.
