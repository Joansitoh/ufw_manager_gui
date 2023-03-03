import sys
import paramiko

from PyQt5 import uic
from PyQt5.QtWidgets import *

from modules import *
from widgets import *

from interfaces import resources_rc

LOGGED_IN = False


class AppUI(QMainWindow):

    def __init__(self, ):
        super(AppUI, self).__init__()

        # SETTING UP UI DEFAULTS
        # ///////////////////////////////////////////////////////////////

        self.setGeometry(0, 0, 640, 400)
        self.ui = uic.loadUi("./interfaces/main.ui", self)

        # get app margins
        self.margins = self.ui.contentsMargins()
        self.ui.setContentsMargins(self.margins.left(), self.margins.top(), self.margins.right(), self.margins.bottom())

        title = "UFW Manager Interface"

        self.setWindowTitle(title)
        self.setWindowFlags(Qt.FramelessWindowHint)
        self.setAttribute(Qt.WA_TranslucentBackground)

        self.ssh_channel = None
        self.ssh_client = None
        self.ufw_handler = None

        # MODULES SETUP
        # ///////////////////////////////////////////////////////////////

        UIFunctions.windowSetup(self)
        LoginFunctions.loginSetup(self)

        # BUTTONS SETUP
        # ///////////////////////////////////////////////////////////////
        self.ui.btn_ports.clicked.connect(self.button_pressed)
        self.push_button(self.ui.btn_login)

        self.ui.toggleButton.clicked.connect(lambda: self.toggle_menu())

        self.show()

    def toggle_menu(self):
        frame = self.ui.leftMenuBg
        hide = frame.width() > 150

        self.animation = UIFunctions.get_horizontal_anim(self, frame, 250, hide)
        self.animation.start()

    def button_pressed(self):
        global LOGGED_IN
        status = LOGGED_IN

        if not status:
            return

        btn = self.sender()
        btnName = btn.objectName()

        # BUTTON MAP
        button_map = {
            "btn_ports": self.ui.ports
        }

        if btnName in button_map:
            self.ui.widgets.setCurrentWidget(button_map[btnName])
            self.push_button(btn)

    def push_button(self, button):
        # Apply style to button
        button.setStyleSheet(UIFunctions.select_widget(button.styleSheet()))
        UIFunctions.reset_style(self, button.objectName())

    def start(self):
        self.ufw_handler = UFWHandler(self.ssh_client, self.ui)
        self.push_button(self.ui.btn_ports)
        global LOGGED_IN
        LOGGED_IN = True


if __name__ == "__main__":
    # Open APP
    app = QApplication(sys.argv)
    window = AppUI()
    sys.exit(app.exec_())
