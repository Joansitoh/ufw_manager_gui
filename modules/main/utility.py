import json

from PyQt5.QtCore import *
from PyQt5.QtGui import *
from PyQt5.QtWidgets import *


class Settings:
    # APP SETTINGS
    # ///////////////////////////////////////////////////////////////
    MENU_WIDTH = 240
    LEFT_BOX_WIDTH = 240
    RIGHT_BOX_WIDTH = 240
    TIME_ANIMATION = 500
    MAX_HEIGHT = 1000

    # BTNS LEFT AND RIGHT BOX COLORS
    BTN_LEFT_BOX_COLOR = "background-color: rgb(44, 49, 58);"
    BTN_RIGHT_BOX_COLOR = "background-color: #ff79c6;"

    # MENU SELECTED STYLESHEET
    MENU_SELECTED_STYLESHEET = """
    border-left: 22px solid qlineargradient(spread:pad, x1:0.034, y1:0, x2:0.216, y2:0, stop:0.499 rgba(255, 121, 198, 255), stop:0.5 rgba(85, 170, 255, 0));
    background-color: rgb(40, 44, 52);
    """


class FileConfig:

    @staticmethod
    def saveToConfig(hashmap, path):
        with open(path, "w") as cache_file:
            json.dump(hashmap, cache_file)

    @staticmethod
    def loadFromConfig(path):
        try:
            with open(path, "r") as cache_file:
                hashmap = json.load(cache_file)
        except FileNotFoundError:
            hashmap = {}
        return hashmap


class MessageBoxUtils:

    @staticmethod
    def msg_warning(title, text):
        try:
            msg = QMessageBox()
            msg.setIcon(QMessageBox.Warning)
            msg.setText(text)
            msg.setWindowTitle(title)
            msg.setStandardButtons(QMessageBox.Ok)
            MessageBoxUtils.style_msg(msg)
            msg.exec_()
        except Exception as e:
            print(e)

    @staticmethod
    def msg_warning_func(text, informative, func):
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Warning)
        msg.setText(text)
        msg.setInformativeText(informative)
        msg.setWindowTitle("Warning")
        msg.setStandardButtons(QMessageBox.Ok | QMessageBox.Cancel)
        msg.buttonClicked.connect(func)
        MessageBoxUtils.style_msg(msg)
        msg.exec_()

    @staticmethod
    def style_msg(msg):
        msg.setStyleSheet("* { background-color: #2a2a2a; color: #ffffff; }" +
                          "QLabel { color: #ffffff; }" +
                          "QPushButton { background-color: #2a2a2a; color: #ffffff; }" +
                          "QPushButton:hover { background-color: #3a3a3a; color: #ffffff; }" +
                          "QPushButton:pressed { background-color: #4a4a4a; color: #ffffff; }")
