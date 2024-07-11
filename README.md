# ReUniteME (BackEnd)

This repository defines API endpoints for the ReuniteME platform, a web-based application designed to facilitate the reunion of person with mental health issues and individuals in endangered situations with their families.

## Table of Contents

- [Introduction](#introduction)
- [API Documentation Link](#api-documentation-link)
- [Technologies Used](#technologies-used)
- [Server Deployment](#server-deployment)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This repository provides endpoints for user registration, contributions, and CRUD operations for both users and admins within the ReuniteME platform.

## API Documentation Link

The API documentation is prepared using Postman.

[Click here](https://documenter.getpostman.com/view/21877600/2sA3e1CW6i) for API documentation.

## Server Deployment

The server is hosted on [Render](https://render.com/) and [click](https://reuniteme-backend.onrender.com/api) here for end points.

The server is hosted on [Render](https://render.com/)

## Technologies Used

- **aws-sdk**: AWS SDK for integrating with Amazon Web Services.
- **bcrypt**: Library for hashing passwords.
- **cookie-parser**: Middleware for parsing cookies in Express.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.
- **dotenv**: Module for loading environment variables from a `.env` file into `process.env`.
- **exif-parser**: Library for parsing EXIF metadata from images.
- **express**: Web framework for Node.js.
- **express-validator**: Middleware for input validation in Express.
- **jsonwebtoken**: Implementation of JSON Web Tokens (JWT) for authentication.
- **mongoose**: MongoDB object modeling tool for Node.js.
- **morgan**: HTTP request logger middleware for Node.js.
- **multer**: Middleware for handling multipart/form-data in Express.
- **nodemailer**: Module for sending emails from Node.js.
- **nodemon**: Utility for auto-restarting the server during development.
- **validator**: Library for string validation and sanitization.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jeelion22/reuniteME-Backend.git
   cd ReuniteME-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a .env file in the root directory and add the required environment variables.

4. **Run the application:**
   ```bash
   npm run dev
## Usage
Once the server is running, you can start making requests to the defined API endpoints. Refer to the API documentation for detailed information on each endpoint and its usage.

## Contributing

Contributions are crucial to enhancing the security, reliability, and functionality of ReuniteME. Your input can help integrate features such as collaboration with government organizations to verify the identities of Reunite Seekers, ensuring credibility and instant verification through authorized bodies, and partnering with asylums to provide support if individuals are not rescued, prioritizing their privacy and safety.

### Goals of Contributions

- **Enhanced Security**: Implement measures to protect the privacy and safety of mentally ill and endangered individuals.
- **Reliability**: Improve the application's reliability through bug fixes and performance enhancements.
- **Feature Expansion**: Add new features that facilitate efficient reunification processes and enhance user experience.

### How You Can Contribute

1. **Code Contributions**: Help develop new features, fix bugs, and optimize performance.
2. **Documentation**: Improve documentation to make it more accessible and comprehensive.
3. **Testing**: Contribute by testing the application and reporting issues or bugs.
4. **Feedback**: Provide feedback on usability, functionality, and potential improvements.

### Guidelines

- **Respect Privacy**: Ensure all contributions prioritize the privacy and safety of individuals involved.
- **Collaboration**: Work together with the community and maintain open communication.
- **Quality Assurance**: Follow best practices for code quality, security, and performance.

Your contributions are valued and essential in making ReuniteME a secure and reliable platform for reuniting families and ensuring the well-being of individuals in need.


## License

MIT License

---