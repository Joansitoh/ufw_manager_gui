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


import requests

from modules import *
from modules.main.utility import MessageBoxUtils


class UFWHandler:

    def __init__(self, ssh_client, ui):
        self.port = ui.ufw_port
        self.protocol = ui.ufw_protocol
        self.from_ip = ui.ufw_from
        self.action = ui.ufw_action

        self.ip_button = ui.ufw_own_ip
        self.add_button = ui.ufw_add_rule
        self.port_table = ui.ports_table

        self.ssh_client = ssh_client

        # Setting up table and buttons
        self.ip_button.clicked.connect(lambda state: self.set_self_ip())
        self.add_button.clicked.connect(lambda state: self.add_rule())

        self.port_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.port_table.resizeColumnsToContents()

        self.reload_table()

    def set_self_ip(self):
        r = requests.get("http://checkip.amazonaws.com")
        ip_address = r.text

        self.from_ip.setText(ip_address.replace(" ", ""))

    def try_delete_rule(self, number):
        MessageBoxUtils.msg_warning_func(
            "Are you sure you want to delete this rule?",
            "This action can't be undone.",
            lambda x: self.delete_rule(number)
        )

    def delete_rule(self, number):
        stdin, stdout, stderr = self.ssh_client.exec_command('sudo ufw --force delete ' + str(number))
        self.reload_table()

    def add_rule(self):
        port = self.port.text().replace(" ", "")
        protocol = self.protocol.currentText().lower()
        from_ip = self.from_ip.text().replace(" ", "")
        action = self.action.currentText().lower()

        # Check if port is valid
        if not port.isdigit():
            MessageBoxUtils.msg_warning("Invalid port", "Port must be a number")
            return

        # Check if from is valid
        if not from_ip == "":
            if not from_ip.count('.') == 3:
                MessageBoxUtils.msg_warning("Invalid IP", "Invalid IP address")
                return

            # Check if IP is valid
            for part in from_ip.split('.'):
                if not part.isdigit():
                    MessageBoxUtils.msg_warning("Invalid IP", "Invalid IP address")
                    return

                if not 0 <= int(part) <= 255:
                    MessageBoxUtils.msg_warning("Invalid IP", "Invalid IP address")
                    return

        if from_ip == "":
            if protocol.lower() == "any":
                command = f"sudo ufw {action} {port}"
            else:
                command = f"sudo ufw {action} {port}/{protocol}"
        else:
            if protocol.lower() == "any":
                command = f"sudo ufw {action} from {from_ip} to any port {port}"
            else:
                command = f"sudo ufw {action} from {from_ip} to any port {port} proto {protocol}"

        # Add rule with ssh
        stdin, stdout, stderr = self.ssh_client.exec_command(command)
        self.reload_table()

    def reload_table(self):
        # Clear table
        ports_table: QTableWidget = self.port_table
        ports_table.setRowCount(0)

        # Read ports from UFW and add them to the table. Columns are 0: port, 1: protocol, 2: action, 3: from
        print("Reloading ports table")
        stdin, stdout, stderr = self.ssh_client.exec_command('sudo ufw status numbered')
        for line in stdout.readlines():
            if "Status: disabled" in line:
                print("UFW is disabled")
                return

            # If not start with [ or contains v6
            if not line.startswith('['):
                continue

            # Example of full line = '[ 4] 8081/tcp                   ALLOW IN    Anywhere'
            first_part = line.split(']')[0]
            rule_number = first_part.replace('[', '').strip()

            second_part = line.split(']')[1]
            parts = second_part.split()
            # Part have to be 4
            if len(parts) < 4:
                continue

            # First part contains the number of the rule. Example '[ 1] '
            # Second part contains 'To' section with Port and Protocol
            to_parts = parts[0].split('/')
            port = to_parts[0]
            protocol = to_parts[1].upper() if len(to_parts) > 1 else 'ANY'

            # Third part contains 'Action'
            action = parts[1].split(" ")[0]

            # Fourth part contains 'From'
            from_addr = parts[3]

            row = ports_table.rowCount()
            ports_table.insertRow(row)
            ports_table.setItem(row, 0, QTableWidgetItem(port))
            ports_table.setItem(row, 1, QTableWidgetItem(protocol))
            ports_table.setItem(row, 2, QTableWidgetItem(action))
            ports_table.setItem(row, 3, QTableWidgetItem(from_addr))

            # For 4 slot, add a button to remove the port
            remove_port_btn = QPushButton()
            remove_port_btn.setIcon(QIcon(":/icons/images/icons/cil-wifi-signal-off.png"))
            remove_port_btn.clicked.connect(lambda state, x=rule_number: self.try_delete_rule(x))
            ports_table.setCellWidget(row, 4, remove_port_btn)
