"""
MIT License

Copyright (c) 2023 Joansiitoh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
"""


# MAIN FILE
# ///////////////////////////////////////////////////////////////
import base64
import json
import os

import paramiko

from .ui_functions import *


class LoginFunctions(AppUI):

    def loginSetup(self):
        self.ui.login_btn.clicked.connect(lambda checked: LoginFunctions.login(self))

        open_file_btn = self.ui.key_btn
        open_file_btn.clicked.connect(lambda checked: LoginFunctions.open_file(self))

        use_passphrase = self.ui.use_passphrase
        use_passphrase.stateChanged.connect(lambda state: LoginFunctions.toggle_passphrase(self, state))

        LoginFunctions.load_cache_file(self)

    def open_file(self):
        file_name = QFileDialog.getOpenFileName(self, 'Open file', 'c:\\')
        self.ui.ssh_key.setText(file_name[0])

    def toggle_passphrase(self, state):
        if state == Qt.Checked:
            self.ui.passphrase.setEnabled(True)
        else:
            self.ui.passphrase.setEnabled(False)

    def login(self):
        if not LoginFunctions.can_login(self):
            QMessageBox.critical(self, "Error", "Please, fill all the fields")
            return

        host = self.ui.host.text()
        username = self.ui.username.text()
        ssh_key = self.ui.ssh_key.text()

        passphrase = None
        if self.ui.use_passphrase.isChecked():
            passphrase = self.ui.passphrase.text()

        LoginFunctions.save_cache_file(self)

        try:
            # AUTHENTICATION
            private_key = None
            if ssh_key != "":
                private_key = paramiko.RSAKey.from_private_key_file(ssh_key, password=passphrase)
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            try:
                if private_key is not None:
                    ssh.connect(host, username=username, pkey=private_key)
                else:
                    ssh.connect(host, username=username)
                channel = ssh.invoke_shell()
                channel.setblocking(0)

                self.ssh_client = ssh
                self.ssh_channel = channel

                LoginFunctions.hide_login(self)
                print("Connected to " + host)
            except Exception as e:
                if ssh is not None:
                    if ssh.get_transport().is_active():
                        ssh.close()
                    else:
                        # open lost connection window
                        return

                print(e)
                raise e
        except Exception as e:
            print(e)
            QMessageBox.critical(self, "Error while connecting to the server", e.__str__())

    def hide_login(self):
        self.animation = QPropertyAnimation(self.ui.login_frame, b"maximumWidth")
        self.animation.setDuration(300)
        self.animation.setStartValue(self.ui.login_frame.width())
        self.animation.setEndValue(0)
        self.animation.setEasingCurve(QEasingCurve.InOutQuart)

        self.animation.start()
        self.animation.finished.connect(lambda: LoginFunctions.change_window(self))

    def show_login(self):
        self.animation = QPropertyAnimation(self.ui.login_profile_frame, b"maximumWidth")
        self.animation.setDuration(300)
        self.animation.setStartValue(self.ui.login_profile_frame.width())
        self.animation.setEndValue(0)
        self.animation.setEasingCurve(QEasingCurve.InOutQuart)

        self.animation.start()
        self.animation.finished.connect(lambda: LoginFunctions.change_window(self, False))

    def logout(self):
        # Close SSH connection
        if self.ssh_client is not None:
            if self.ssh_client.get_transport().is_active():
                self.ssh_client.close()
                print("SSH connection closed")

        self.ufw_handler = None
        self.ssh_channel = None
        self.ssh_client = None

        LoginFunctions.show_login(self)
        pass

    def change_window(self, login=True):
        if login:
            self.ui.login_frame.hide()
            self.ui.widgets.setCurrentWidget(self.ui.ports)
            self.start()
        else:
            self.ui.login_frame.show()
            self.ui.login_frame.setMaximumWidth(100000)
            self.ui.widgets.setCurrentWidget(self.ui.login_page)

    def can_login(self):
        if self.ui.username.text() == "":
            return False
        if self.ui.use_passphrase.isChecked():
            if self.ui.passphrase.text() == "":
                return False
        return True

    def save_cache_file(self):
        # Obtener los datos de los campos de entrada
        host = self.ui.host.text()
        username = self.ui.username.text()
        private_key = self.ui.ssh_key.text()
        use_passphrase = self.ui.use_passphrase.isChecked()
        passphrase = self.ui.passphrase.text()

        # Encode with base64
        pass_crypt = base64.b64encode(passphrase.encode("utf-8")).decode("utf-8")

        cache = {
            "host": host,
            "username": username,
            "private_key": private_key,
            "use_passphrase": use_passphrase,
            "passphrase": pass_crypt
        }

        FileConfig.saveToConfig(cache, FileConfig.getHomePath() + "/.ufw_cache.json")

    def load_cache_file(self):
        cache = FileConfig.loadFromConfig(FileConfig.getHomePath() + "/.ufw_cache.json")
        if cache is None or cache == {}:
            return

        self.ui.host.setText(cache["host"])
        self.ui.username.setText(cache["username"])
        self.ui.ssh_key.setText(cache["private_key"])
        self.ui.use_passphrase.setChecked(cache["use_passphrase"])

        if cache["use_passphrase"]:
            pass_crypt = cache["passphrase"]
            try:
                passphrase = base64.b64decode(pass_crypt.encode("utf-8")).decode("utf-8")
                self.ui.passphrase.setText(passphrase)
            except Exception as e:
                print(e)
