# <div align="center"><img src="/images/logo.png" alt="UFW GUI Manager logo"></div>

# UFW GUI Manager

## Table of Contents

- [Requirements](#-requirements)
- [How to use UFW GUI Manager](#-how-to-use-ufw-gui-manager)
- [Features](#-features)
- [Images](#%EF%B8%8F-images)
- [Contributing](#-contributing)
- [License](#-license)

---

UFW GUI Manager is a Python application that allows you to manage UFW (Uncomplicated Firewall) ports on a remote machine via SSH. The application features a simple and user-friendly graphical interface.

## 📋 Requirements

To use UFW GUI Manager, you'll need to have the following installed:

- Python 3.x
- Paramiko
- UFW

## 💻 How to use UFW GUI Manager

1. Clone this repository:
    ```
    git clone https://github.com/Joansitoh/ufw_manager_gui.git
    ```

2. Install dependencies:
    ```
    pip install -r requirements.txt
    ```

3. Run the application:
    ```
    python3 main.py
    ```


4. Enter the connection details for the remote machine (IP address, username, and password).

5. Once connected, you can view the list of open ports on the machine and add or remove ports as needed.

## 🌟 Features

- User-friendly graphical interface
- Secure SSH connection
- List view of open ports
- Add or remove ports with a single click

## 🖼️ Images

Here are some screenshots of UFW GUI Manager in action:

![UFW GUI Manager screenshot 1](/screenshots/screenshot1.png)
_UFW GUI Manager main window_

![UFW GUI Manager screenshot 2](/screenshots/screenshot2.png)
_List view of open ports on the remote machine_

## 🤝 Contributing

If you would like to contribute to UFW GUI Manager, you can do so via pull requests. Please be sure to follow the contribution guidelines before making any changes.

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for more information.
