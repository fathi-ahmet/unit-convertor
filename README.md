# Unit Converter

A lightweight, server-rendered unit conversion web app built with
**Node.js** and **Express**. It supports length, weight, and temperature
conversions through a simple, responsive interface.

## Features

- **Length conversions:** millimeters, centimeters, meters,
  kilometers, inches, feet, yards, and miles.
- **Weight conversions:** milligrams, grams, kilograms, ounces, and
  pounds.
- **Temperature conversions:** Celsius, Fahrenheit, and Kelvin.
- Separate pages for each measurement category.
- Server-side form handling and input validation.
- Clear error messages for invalid values and physically invalid
  temperatures.
- Results rounded to a maximum of six decimal places, with trailing
  zeros removed.
- Responsive styling and visible keyboard-focus indicators.

## Requirements

- [Node.js](https://nodejs.org/) (a current LTS release is
  recommended)
- npm (included with Node.js)

## Getting Started

1.  Extract the project archive.

2.  Open a terminal in the `unit-converter` project directory.

3.  Install the dependencies:

    ```bash
    npm install
    ```

4.  Start the server:

    ```bash
    npm start
    ```

5.  Open the app in your browser:

    <http://localhost:3000>

The root URL redirects to the length converter.

## Available Pages

URL Description

---

`/length` Convert between length units
`/weight` Convert between weight units
`/temperature` Convert between temperature units

## How to Use

1.  Choose a measurement category using the tabs.
2.  Enter the value you want to convert.
3.  Select the source unit.
4.  Select the destination unit.
5.  Select **Convert** to view the result.
6.  Select **Reset** to start another conversion in the same category.

## Configuration

The server listens on port `3000` by default. To use a different port,
set the `PORT` environment variable before starting the app.

**macOS / Linux**

```bash
PORT=4000 npm start
```

**Windows PowerShell**

```powershell
$env:PORT=4000
npm start
```

Then visit `http://localhost:4000`.

## Project Structure

```text
unit-converter/
├── public/
│   └── style.css     # Page layout, form controls, and visual styling
├── package.json      # Project metadata, start script, and dependencies
├── server.js         # Express server, conversion logic, validation, and HTML rendering
└── README.md         # Project documentation
```

## Implementation Notes

- The app uses Express to serve static assets and handle form
  submissions.
- Length and weight units are converted through a shared base-unit
  factor.
- Temperature conversions use Celsius as the intermediate value.
- Input accepts signed decimal and scientific-notation numbers, with
  optional comma separators.
- Invalid numeric input and unsupported unit selections are rejected
  with an explanatory message.
- Absolute-zero checks prevent temperatures below zero Kelvin.

## Dependencies

- [Express](https://expressjs.com/) `^4.19.2`

## Development

Run the server with:

```bash
npm start
```

The project currently has no automated test script configured in
`package.json`.

## License

No license is specified in the project files. Add a `LICENSE` file
before distributing the project if you intend to grant others formal
reuse rights.

## Project URL

[Unit Converter project](https://roadmap.sh/projects/unit-converter)
