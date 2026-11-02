# The BNB - Full-Stack Accommodation Marketplace

A production-ready vacation rental web application modeled after Airbnb. Built using Node.js, Express, MongoDB Atlas, and EJS, the platform supports authenticated listing management, multi-file image storage via Cloudinary, server-side data sanitization and validation, interactive geospatial mapping through Mapbox, and user reviews.

**Live Demo:** [https://the-bnb.onrender.com/]

## Architectural Overview

The application follows the classic Model-View-Controller (MVC) pattern alongside a RESTful API design. Server-side rendering (SSR) is utilized with EJS and EJS-Mate layouts to optimize page delivery and maintain uniform frontend structure.

### Core Architecture Flow
1. **Routing & Middleware Pipeline:** Incoming requests pass through custom logging, cookie parsing, session extraction, and Passport authentication middleware before reaching designated routers (`/listings`, `/reviews`, `/`).
2. **File Processing:** Uploaded images bypass local filesystem bottlenecks via `multer` coupled with `multer-storage-cloudinary`, streaming files straight to cloud asset storage and injecting remote asset URLs into request objects.
3. **Geospatial Pipeline:** Listing addresses are geocoded asynchronously using the Mapbox Geocoding SDK. Resulting coordinates are stored as standard GeoJSON Point features to drive frontend map rendering.
4. **Data Validation:** Request bodies undergo dual-layer validation—strict schema enforcement via Joi prior to persistence, followed by Mongoose model validation at the database boundary.
5. **Session Management:** User sessions are offloaded from process memory into MongoDB Atlas using `connect-mongo`, enabling seamless server restarts and multi-instance statelessness.

---

## Tech Stack & Dependencies

### Backend & Core Runtime
- **Node.js:** Server-side runtime environment executing the event-driven JavaScript backend.
- **Express.js:** Web application framework managing HTTP routing, request/response cycles, and custom middleware pipelines.
- **MongoDB Atlas:** Cloud-hosted NoSQL database storing users, listings, reviews, and session documents.
- **Mongoose:** Object Data Modeling (ODM) library providing schema structure, type casting, validation, and middleware hooks (e.g., cascading review deletion on listing removal).

### Authentication & Security
- **Passport.js & Passport-Local:** Authentication middleware implementing username and password strategies.
- **Passport-Local-Mongoose:** Simplifies Mongoose model integration with salt-and-hash storage via crypto-grade PBKDF2 hashing.
- **Express-Session & Connect-Mongo:** Persistent session store using HTTP-only cookies to mitigate client-side script tampering (XSS session theft).
- **Joi:** Object schema definition language and validator used to enforce strict payloads for listings and reviews.

### Media & Geospatial Services
- **Cloudinary:** Cloud-based media management platform handling asset optimization, responsive cropping, and secure content delivery.
- **Multer & Multer-Storage-Cloudinary:** Middleware handling `multipart/form-data` stream uploads directly to designated Cloudinary storage folders.
- **Mapbox SDK (`@mapbox/mapbox-sdk`):** Provides forward geocoding services, transforming textual locations (e.g., city, state, country) into geographic `[longitude, latitude]` arrays.
- **Mapbox GL JS:** Client-side vector map renderer visualizing listing coordinates via interactive pins and popups.

### Frontend & UI
- **EJS (Embedded JavaScript) & EJS-Mate:** Server-side templating engine enabling partial layouts, layout inheritance, and dynamic data binding.
- **Bootstrap 5:** Mobile-responsive grid system, navigation headers, modal dialogs, and styled form controls.
- **FontAwesome:** Scalable iconography used across category navigation, filters, and operational UI buttons.
- **Starability CSS:** Accessible, pure CSS star rating widgets for review forms.

---

## Key Features

### 1. Listing Management (CRUD)
- Browse active listings with dynamic search filtering across titles, locations, and countries.
- Create new listings with integrated file upload handling and dynamic geocoding.
- Edit existing listing attributes, with intelligent thumbnail previews and partial updates.
- Delete listings with automated database cascades that clean up associated reviews.

### 2. User Authentication & Authorization
- Role-based permissions preventing unauthorized modifications: only verified owners can edit or delete their listings.
- Review deletion restricted to original authors.
- Protected route handling with automatic redirection to original target URLs upon successful authentication.

### 3. Geospatial Mapping
- Automated coordinate lookup during listing creation.
- High-precision Mapbox map displayed on every listing detail page, pinned to the exact location coordinates.

### 4. Interactive Review System
- 1-to-5 star rating validation with custom textual feedback.
- Individual review deletion with UI synchronization.

### 5. Media Upload Pipeline
- Multipart image processing with automatic upload to secure CDN URLs.
- Image transformation URLs that generate responsive thumbnail previews for edit views.

---

## Database Schemas

### Listing Schema
```javascript
{
  title: { type: String, required: true },
  description: String,
  image: {
    url: String,
    filename: String
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    { type: Schema.Types.ObjectId, ref: "Review" }
  ],
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}

### Review Schema

{
  comment: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User" }
}

### User Schema

{
  email: { type: String, required: true, unique: true }
  // username, hash, and salt are added automatically by passport-local-mongoose
}

### Directory structure

├── controllers/          # Request handlers and business logic
│   ├── listing.js        # Listing lifecycle and geocoding operations
│   ├── review.js         # Review creation and cleanup handlers
│   └── user.js           # Authentication and registration logic
├── models/               # Mongoose data schemas
│   ├── listing.js        # Listing collection definition & cascading hooks
│   ├── review.js         # Review schema definition
│   └── user.js           # User schema augmented with passport plugin
├── public/               # Static assets served directly
│   ├── css/              # Application stylesheets
│   └── js/               # Client-side map rendering and form validation
├── routes/               # Express routing groups
│   ├── listing.js        # /listings endpoint routes
│   ├── review.js         # Nested /listings/:id/reviews routes
│   └── user.js           # Root auth routes (/signup, /login, /logout)
├── utils/                # Helper utilities
│   ├── ExpressError.js   # Custom HTTP error class
│   └── wrapAsync.js      # Async exception handling wrapper
├── views/                # EJS templates
│   ├── includes/         # Reusable template components (nav, footer, flash)
│   ├── layouts/          # Base template wrappers (Boilerplate.ejs)
│   ├── listing/          # Listing views (index, show, new, edit)
│   └── users/            # Authentication forms (login, signup)
├── app.js                # Server initialization and middleware pipeline
├── cloudconfig.js        # Cloudinary SDK and storage engine setup
├── middleware.js         # Authentication, authorization, and Joi middleware
├── schema.js             # Joi input validation schemas
└── package.json          # Node modules and operational script definitions

### Local Setup & Installation

 - Prerequisites
    Node.js (v18.0.0 or higher)
    npm (v9.0.0 or higher)
    MongoDB Atlas account or running local MongoDB instance
    Cloudinary account for media hosting
    Mapbox developer account for public access tokens

### Installation Steps

  1. Clone the repository
    git clone https://github.com/aditya-nehare/bnb.git

  2. Install Dependencies
    npm install --legacy-peer-deps

  3. Create .env
    PORT=8080
    MONGO_URL=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/wanderlust?retryWrites=true&w=majority
    SECRET=yourCustomSessionSecretString

    # Cloudinary Configuration
    CLOUD_NAME=your_cloudinary_cloud_name
    CLOUD_API_KEY=your_cloudinary_api_key
    CLOUD_API_SECRET=your_cloudinary_api_secret

    # Mapbox Configuration
    MAP_TOKEN=pk.your_mapbox_public_token

  4. Start the application locally
    npm run dev
    # or
    node app.js
