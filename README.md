## TripSpot

A CRUD listings web app for travel stays. Built to practice full‑stack basics: Express routing, server‑rendered EJS views with layouts/partials, MongoDB data modeling, and RESTful forms (including PUT/DELETE via method override).

### Why this project exists (for future me)

- Learn and solidify fundamentals of Express, EJS, and Mongoose.
- Practice RESTful routing, templates, and basic data validation.
- Build an end‑to‑end app: seed sample data, render lists/details, and edit/delete items.

### Core features

- Browse all listings, view details, create, edit, and delete.
- Server‑side rendering with EJS layouts/partials via `ejs-mate`.
- MongoDB persistence with a clean `Listing` schema.
- Seeder to quickly reset and populate the DB with realistic data.

### Tech stack

- **Server**: Express
- **Views**: EJS with `ejs-mate` layouts/partials
- **Database**: MongoDB with Mongoose
- **Forms**: `method-override` for PUT/DELETE

### Prerequisites

- Node.js 18+
- MongoDB running locally (default) or a connection string

### Installation

```bash
git clone <repo-url>
cd "Open Doors"
npm install
```

### Configuration

The app connects to MongoDB at `mongodb://localhost:27017/TripSpot` by default (see `index.js` and `init/index.js`). If your MongoDB runs elsewhere, update the connection URI in those files.

Port defaults to `8080`.

### Seed the database (optional)

Sample listings are available under `init/data.js`.

Run the seeder to wipe and repopulate the `TripSpot` database:

```bash
node init/index.js
```

### Run the app

```bash
node index.js
```

Then open `http://localhost:8080/listings`.

### Available routes

- **GET** `/listings`: List all listings
- **GET** `/listing/new`: New listing form
- **POST** `/listings`: Create listing
- **GET** `/listing/:id`: Show a listing
- **GET** `/listing/:id/edit`: Edit form
- **PUT** `/listing/:id`: Update listing
- **DELETE** `/listing/:id`: Delete listing
- **GET** `/auth/login`: Login page (static view)
- **GET** `/signup`: Signup page (static view)

### Data model (Mongoose `Listing`)

Fields:

- **title**: String, required, max 50
- **desc**: String, required, max 500
- **image**: `{ filename: String, url: String }` with defaults
- **price**: Number, required, min 0
- **location**: String, required, max 100
- **country**: String, required, max 50

### Project structure (matches repo tree)

```bash
Open Doors/
  index.js                 # Express app and routes
  package.json
  package-lock.json
  public/
    css/
      style.css            # Global styles
    js/
      script.js            # Client-side scripts (if any)
  models/
    listing.js             # Mongoose Listing schema/model
  init/
    data.js                # Sample listings
    index.js               # Seed script (connects, wipes, inserts)
  views/
    layouts/
      boilerplate.ejs      # Base layout used by ejs-mate
    includes/
      navbar.ejs           # Shared navbar partial
      footer.ejs           # Shared footer partial
      main.ejs             # Optional shared wrapper/section
    auth/
      login.ejs            # Login page (static)
      signup.ejs           # Signup page (static)
    listings/
      index.ejs            # List all listings
      newListing.ejs       # Create listing form
      editListing.ejs      # Edit listing form
      show.ejs             # Listing details page
    main.ejs               # Home/landing view (if used)
```

### Developer notes and tips

- Views use `ejs-mate`; ensure the app sets the view engine correctly (`app.set("view engine", "ejs")`) and the engine (`app.engine("ejs", ejsMate)`).
- Static files are served from `public/`.
- For PUT/DELETE, submit forms with `_method=PUT|DELETE`.
- If CRUD fails, check Mongo is running and the connection URI.

### Common tweaks (optional)

- Add a start script in `package.json` to simplify running:
  ```json
  "scripts": { "start": "node index.js" }
  ```
- Replace the default image URL in `models/listing.js` with your own placeholder.
- Swap the local Mongo URI with an environment variable when deploying.

### Roadmap ideas (future improvements)

- Form validation and flash messages
- Authentication and authorization for create/edit/delete
- Image upload (Cloud storage) and multiple photos per listing
- Pagination and search filters for `/listings`

### License

ISC © vedant hande
