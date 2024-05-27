<p align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
</p>
<p align="center">
    <h1 align="center">UFW MANAGER GUI</h1>
</p>
<p align="center">
    <em>UFW Manager GUI is a graphical user interface for managing the Uncomplicated Firewall (UFW) on Linux systems.</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/Joansitoh/ufw_manager_gui?style=default&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/Joansitoh/ufw_manager_gui?style=default&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/Joansitoh/ufw_manager_gui?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/Joansitoh/ufw_manager_gui?style=default&color=0080ff" alt="repo-language-count">
<p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>
<hr>

## Quick Links

> - [ Overview](#overview)
> - [ Features](#features)
> - [ Modules](#modules)
> - [ Getting Started](#getting-started)
>   - [ Installation](#installation)
>   - [ Running ufw_manager_gui](#running-ufw_manager_gui)
> - [ Project Roadmap](#project-roadmap)
> - [ Contributing](#contributing)
> - [ License](#license)

---

## Overview

The ufw_manager_gui project is a graphical user interface for managing the Uncomplicated Firewall (UFW) on Linux systems. It provides an intuitive interface for users to configure firewall rules and settings without needing to use the command line. The project leverages Electron and React to create a cross-platform desktop application that simplifies the firewall management process. Key features include rule creation, deletion, and modification, as well as status monitoring and logging. The project aims to enhance the user experience of managing the UFW by offering a user-friendly interface with visual feedback and real-time updates. Additionally, the codebase includes linting configurations and recommended practices for maintaining clean and efficient code. Overall, ufw_manager_gui offers users a convenient tool for managing their firewall settings with ease.

---

<div style="display:flex; justify-content:space-between;">
  <img src="https://imgur.com/KkLVB79.png" alt="Preview Home" width="400"/>
  <img src="https://imgur.com/WBFuXRC.png" alt="Preview About" width="400"/>
  <img src="https://imgur.com/kG1ymf5.gif" alt="Preview" width="400"/>
</div>

---

## Features

|     | Feature          | Description                                                                                                                                                                                                                                 |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚙️  | **Architecture** | The project follows a React-based architecture and utilizes Vite as the build tool. It uses Tailwind CSS for styling and Framer Motion for animations. The project structure and organization are not explicitly mentioned.                 |
| 🔌  | **Integrations** | Key integrations include React, Tailwind CSS, Framer Motion, and Vite. These external dependencies are required for the project to function properly.                                                                                       |
| 📦  | **Dependencies** | The key dependencies of the project include React, Tailwind CSS, Framer Motion, Vite, and other related dependencies required for development and building the project.                                                                     |
| 🚀  | **Scalability**  | The project is designed with scalability in mind, allowing you to easily add as many pages as needed to accommodate future growth. The architecture and tools chosen provide a flexible foundation for handling increased traffic and load. |

---

## Modules

<details closed><summary>Configuration</summary>

| File                                                                                                  | Summary                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [configuration.json](https://github.com/Joansitoh/ufw_manager_gui/blob/master/cfg\configuration.json) | This code snippet contributes to a developer portfolio website's architecture. It handles the configuration details for the website, such as the theme, navbar links, header information, project details, and technologies used. |

</details>

---

## Getting Started

**_Requirements_**

Ensure you have the following dependencies installed on your system:

- **Nodejs**: `version 20.X.X`

### Installation

1. Clone the ufw_manager_gui repository:

```sh
git clone https://github.com/Joansitoh/ufw_manager_gui
```

2. Change to the project directory:

```sh
cd ufw_manager_gui
```

3. Install the dependencies:

```sh
npm install
```

### Running ufw_manager_gui

Use the following command to run ufw_manager_gui:

```sh
node run dev
```

---

## Project Roadmap

- [x] `► Create configuration file`
- [ ] `► Animate background`

---

## Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Submit Pull Requests](https://github/Joansitoh/ufw_manager_gui/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **[Join the Discussions](https://github/Joansitoh/ufw_manager_gui/discussions)**: Share your insights, provide feedback, or ask questions.
- **[Report Issues](https://github/Joansitoh/ufw_manager_gui/issues)**: Submit bugs found or log feature requests for ufw_manager_gui.

<details closed>
    <summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your GitHub account.
2. **Clone Locally**: Clone the forked repository to your local machine using a Git client.
   ```sh
   git clone https://github.com/Joansitoh/ufw_manager_gui
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to GitHub**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

Once your PR is reviewed and approved, it will be merged into the main branch.

</details>

---

## License

This project is protected under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For more details, refer to the [LICENSE](https://www.apache.org/licenses/LICENSE-2.0) file.|

---

[**Return**](#quick-links)

---
