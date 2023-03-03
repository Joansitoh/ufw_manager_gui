# MAIN FILE
# ///////////////////////////////////////////////////////////////
from PyQt5.uic.properties import QtCore

from main import *
from .utility import *
from . login_functions import *

APP_MAXIMIZED = False


class UIFunctions(AppUI):

    def select_widget(style):
        select = style + Settings.MENU_SELECTED_STYLESHEET
        return select

    def unselect_widget(style):
        deselect = style.replace(Settings.MENU_SELECTED_STYLESHEET, "")
        return deselect

    def reset_style(self, widget):
        for w in self.ui.widgets_menu.findChildren(QPushButton):
            if w.objectName() != widget:
                w.setStyleSheet(UIFunctions.unselect_widget(w.styleSheet()))

    def maximize_restore(self):
        global APP_MAXIMIZED
        status = APP_MAXIMIZED

        if not status:
            self.showMaximized()
            APP_MAXIMIZED = True
            self.ui.setContentsMargins(0, 0, 0, 0)
            self.ui.maximizeRestoreAppBtn.setToolTip("Restore")
            self.ui.maximizeRestoreAppBtn.setIcon(QIcon(u":/icons/images/icons/icon_restore.png"))
            self.ui.frame_size_grip.hide()
            self.left_grip.hide()
            self.right_grip.hide()
            self.top_grip.hide()
            self.bottom_grip.hide()
        else:
            APP_MAXIMIZED = False
            self.showNormal()
            self.resize(self.width() / 2, self.height() / 2)
            # self.ui.setContentsMargins(10, 10, 10, 10)
            self.ui.maximizeRestoreAppBtn.setToolTip("Maximize")
            self.ui.maximizeRestoreAppBtn.setIcon(QIcon(u":/icons/images/icons/icon_maximize.png"))
            self.ui.frame_size_grip.show()
            self.left_grip.show()
            self.right_grip.show()
            self.top_grip.show()
            self.bottom_grip.show()

    # RETURN STATUS
    # ///////////////////////////////////////////////////////////////
    def returStatus(self):
        return APP_MAXIMIZED

    # SET STATUS
    # ///////////////////////////////////////////////////////////////
    def setStatus(self, status):
        global APP_MAXIMIZED
        APP_MAXIMIZED = status

    def windowSetup(self):

        def dobleClickMaximizeRestore(event):
            # IF DOUBLE CLICK CHANGE STATUS
            if event.type() == QEvent.MouseButtonDblClick:
                QTimer.singleShot(250, lambda: UIFunctions.maximize_restore(self))

        # MOVE WINDOW / MAXIMIZE / RESTORE
        def moveWindow(event):
            if UIFunctions.returStatus(self):
                UIFunctions.maximize_restore(self)
            if event.buttons() == Qt.LeftButton:
                self.move(self.pos() + event.globalPos() - self.dragPos)
                self.dragPos = event.globalPos()
                event.accept()

        def set_drag_pos(event):
            self.dragPos = event.globalPos()

        self.ui.titleRightInfo.mouseDoubleClickEvent = dobleClickMaximizeRestore
        self.ui.titleRightInfo.mouseMoveEvent = moveWindow
        self.ui.titleRightInfo.mousePressEvent = set_drag_pos

        # CUSTOM GRIPS
        self.left_grip = CustomGrip(self, Qt.LeftEdge, True)
        self.right_grip = CustomGrip(self, Qt.RightEdge, True)
        self.top_grip = CustomGrip(self, Qt.TopEdge, True)
        self.bottom_grip = CustomGrip(self, Qt.BottomEdge, True)

        # DROP SHADOW
        self.shadow = QGraphicsDropShadowEffect(self)
        self.shadow.setBlurRadius(17)
        self.shadow.setXOffset(0)
        self.shadow.setYOffset(0)
        self.shadow.setColor(QColor(0, 0, 0, 150))
        self.ui.bgApp.setGraphicsEffect(self.shadow)

        # RESIZE WINDOW
        self.sizegrip = QSizeGrip(self.ui.frame_size_grip)
        self.sizegrip.setStyleSheet("width: 20px; height: 20px; margin 0px; padding: 0px;")

        # MINIMIZE
        self.ui.minimizeAppBtn.clicked.connect(lambda: self.showMinimized())

        # MAXIMIZE/RESTORE
        self.ui.maximizeRestoreAppBtn.clicked.connect(lambda: UIFunctions.maximize_restore(self))

        # CLOSE APPLICATION
        self.ui.closeAppBtn.clicked.connect(lambda: self.close())

    def resize_grips(self):
        self.left_grip.setGeometry(0, 10, 10, self.height())
        self.right_grip.setGeometry(self.width() - 10, 10, 10, self.height())
        self.top_grip.setGeometry(0, 0, self.width(), 10)
        self.bottom_grip.setGeometry(0, self.height() - 10, self.width(), 10)


    # ///////////////////////////////////////////////////////////////
    # ANIMATIONS

    def run_group(self, *args):
        self.group = QParallelAnimationGroup()

        # CHECK IF ARGS IS ONLY ONE AND ITS A LIST
        for animation in args:
            if animation is not None:
                self.group.addAnimation(animation)

        # List of animations
        self.group.start()

    def get_vertical_anim(self, frame, height, hide):
        animation = QPropertyAnimation(frame, b"maximumHeight")
        animation.setDuration(Settings.TIME_ANIMATION)
        animation.setStartValue(frame.height() if hide else 0)
        animation.setEndValue(0 if hide else height)
        animation.setEasingCurve(QEasingCurve.InOutQuart)
        return animation

    def get_horizontal_anim(self, frame, width, hide):
        animation = QPropertyAnimation(frame, b"maximumWidth")
        animation.setDuration(Settings.TIME_ANIMATION)
        animation.setStartValue(frame.width() if hide else 0)
        animation.setEndValue(0 if hide else width)
        animation.setEasingCurve(QEasingCurve.InOutQuart)
        return animation
