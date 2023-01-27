<a name="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/KristianMarshall/EnvelopeBudget">
    <img src="Pictures/moneyEnvelope.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Envelope Budget</h3>

  <p align="center">
    a budgeting webapp to help you use the envelope budgeting method virtually
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![dashboard-screenshot]

Envelope Budget is a virtual budgeting tool that helps you manage your finances using the envelope budgeting method. It allows you to create virtual "envelopes" for different spending categories and allocate a certain amount of money to each envelope. As you make purchases, you can track your spending and adjust your budget as needed.

I like to understand my personal finances in depth, so for the past 3 years I've been using a heavily modified version of a popular envelope budgeting spreadsheet called <a href="https://aspirebudget.com/">Aspire Budget</a>. However, I have run into the limitations of spreadsheets several times when attempting to add new features. When I learned about databases in my first semester I knew immediately what side project I wanted to work on. I quickly began creating the underlying database using my spreadsheet as a template. Once I had a solid design in place I realized I had no idea how or what framework to use to create a frontend, so the project became shelved while I focused on school. Then third semester rolls around and we learn Javascript, and they teach us about Node.js and express. Then I again immediately knew I had to try using it for my side project.

I was pretty happy with the functionality. However I was not happy with the looks as here is a screenshot before I learned about bootstrap.

![oldDashboard-screenshot]

One bonus to bootstrap is it also helped me make the page responsive. This is handy to use the app on my phone.

![dashboardPhone-screenshot] ![transactionsPhone-screenshot] ![sidebarPhone-screenshot]

Overall I'm pretty happy with the project and I think it can now replace my spreadsheet. but I think it's going to be one of those projects where i will always be adding new features and tweaking something.



<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* <a href="https://nodejs.org/">Node.js</a>
* <a href="https://www.docker.com/">Docker</a>
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You'll need a MySql Database and the latest version of node package manager. 
* MySQL
  ```sh
  docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
  ```
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/KristianMarshall/EnvelopeBudget.git
   ```
2. Install the dependencies
   ```sh
   npm install
   ```
3. Update the 'config.js' file with your MySQL credentials.
   ```js
   host: "localhost",
   user: "your user",
   password: "your password",
   port: "3306"
   ```
4. Start the server then open a web browser and go to <a href="http://localhost:3000">http://localhost:3000</a>
   ```sh
   node server.js
   ```
   
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

This is the dashboard it gives you an overview of your accounts as well as the balance and activity in each of your various envelopes.
![dashboard-screenshot]

This is the transactions page. it allows you to edit/add transactions and you can mark them as pending(denoted by the blue tint).
![transactions-screenshot]

Here is an example of the account report it shows you your income and expenses as well as your net income for each month.
![accountReport-screenshot]

The settings page is where you setup your accounts and envelopes.
![settings-screenshot]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Get database setup
- [x] Build mvp frontend
- [ ] Add Settings
    - [x] Accounts
    - [ ] Envelopes
    - [ ] Preferences
- [ ] User Feedback for validation
- [ ] Charts/Reports
    - [x] Account
    - [ ] Net Worth
    - [ ] Categories

See the [open issues](https://github.com/KristianMarshall/EnvelopeBudget/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Kristian Marshall - Kristian.Marshall2@student.sl.on.ca

Project Link: [https://github.com/KristianMarshall/EnvelopeBudget](https://github.com/KristianMarshall/EnvelopeBudget)

<p align="right">(<a href="#readme-top">back to top</a>)</p>




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[oldDashboard-screenshot]: Pictures/Old%20Dashboard.png
[dashboard-screenshot]: Pictures/Dashboard.png
[transactions-screenshot]: Pictures/Transactions.png
[settings-screenshot]: Pictures/Settings.png
[sidebarPhone-screenshot]: Pictures/sidebarPhone.png
[transactionsPhone-screenshot]: Pictures/transactionsPhone.png
[dashboardPhone-screenshot]: Pictures/dashboardPhone.png
[accountReport-screenshot]: Pictures/Account%20Report.png
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
