# CoolNest AC Care — Sliubar Concept Project

A complete fictional case-study website and software demo built with plain HTML, CSS, vanilla JavaScript, and browser localStorage.

CoolNest is not a real client or operating company. Pricing, plans, service areas, booking records, workflows, and notifications are demonstration content.

## Final file structure

```text
coolnest-demo/
├── index.html
├── services.html
├── booking.html
├── confirmation.html
├── dashboard.html
├── case-study.html
├── styles.css
├── script.js
└── README.md
```

## How the pages connect

- `index.html` is the main customer website. It includes the service finder, service cards, care plans, FAQs, and Nora assistant.
- `services.html` explains and compares every fictional CoolNest service.
- `booking.html` contains the five-step booking flow. Query parameters from the homepage, service page, or Nora can preselect details.
- `confirmation.html` reads the newly submitted booking from localStorage and displays its reference and summary.
- `dashboard.html` reads all local bookings and lets the prototype owner search, filter, sort, view, update, and delete them.
- `case-study.html` explains the fictional business challenge, Sliubar solution, customer journey, scope, and intended impact.
- `styles.css` controls the shared design system and responsive layouts.
- `script.js` controls recommendations, booking, localStorage, confirmation, Nora, FAQs, mobile navigation, and dashboard features.

## Open the project

1. Extract the ZIP file.
2. Open the `coolnest-demo` folder.
3. Double-click `index.html`.
4. The project should open directly in your browser. No installation, Node.js, npm, terminal, or local server is required.

The Google font is loaded from a free CDN. If the internet is unavailable, the site falls back to system fonts and remains usable.

## Test the booking flow

1. Open `index.html`.
2. Choose an issue in the service finder and continue with the recommended service, or select **Book an AC Service**.
3. Complete all five booking steps.
4. Submit the request.
5. The confirmation page should show the booking reference and submitted details.
6. Select **View owner dashboard** to confirm the booking appears there.

## Test Nora

1. Open any customer-facing page.
2. Select the floating chat button in the bottom-right corner.
3. Describe a problem such as `water leaking`, `not cooling`, `strange smell`, or `routine cleaning`.
4. Answer the property, unit, area, and urgency questions.
5. Continue to the booking page and confirm the recommended service is selected.

Nora is a predefined JavaScript assistant. It is not connected to an AI API and does not make confirmed technical diagnoses.

## Test the dashboard

Open `dashboard.html` and use:

```text
Email: owner@coolnest.demo
Password: demo123
```

After login:

1. Select **Load Demo Bookings** to add sample records.
2. Search by reference, customer, service, or area.
3. Filter by status or urgency.
4. Change the sort order.
5. Open a booking and update its status.
6. Review the analytics and maintenance-reminder sections.
7. Select **Clear Demo Data** to remove only the generated demo records.

The dashboard login is only a visual prototype and is not secure authentication.

## Clear localStorage

### Easiest method

Open the browser's developer tools, go to **Application** or **Storage**, open **Local Storage**, select the current site or local file entry, and delete these keys:

```text
coolnestBookings
coolnestLastBookingRef
```

You can also clear all site data for the page through your browser settings. This removes customer-created bookings as well as demo bookings.

Dashboard login state is stored in sessionStorage and normally clears when the browser session ends. You can also use the dashboard's **Log out** button.

## Publish with GitHub Pages without a terminal

1. Sign in to GitHub and create a new repository, for example `coolnest-demo`.
2. Make the repository public if you are using GitHub Free.
3. Open the repository and choose **Add file → Upload files**.
4. Upload the project files so that `index.html` is at the repository root, not inside another nested folder.
5. Commit the uploaded files to the `main` branch.
6. Open **Settings → Pages**.
7. Under **Build and deployment**, choose **Deploy from a branch**.
8. Select the `main` branch and the `/(root)` folder, then save.
9. GitHub will display the published website address in the Pages settings after deployment.

Because the project uses relative links and static files only, it is suitable for GitHub Pages without a build process.

## Editing notes

- Edit text directly inside the relevant HTML file.
- Change colours, spacing, typography, cards, and responsive styles in `styles.css`.
- Change service prices and booking logic near the top of `script.js`.
- Replace the CSS illustration later without affecting the booking system.
- Do not add real customer information to a public demo repository.
