import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  PanResponder,
  BackHandler,
  Image,
  ScrollView,
} from "react-native";
import { useRef, useState, useEffect, useCallback } from "react";
import { useTheme } from "../themes/ThemeContext";

const { height: screenHeight } = Dimensions.get("window");

interface BottomSheetProps {
  children?: React.ReactNode;
  title?: string;
  closedTitle?: string;
  onStateChange?: (isOpen: boolean) => void;
}

export default function BottomSheet({
  children,
  title = "Tu cuadre de lucas",
  closedTitle = "Ver tus gastos",
  onStateChange,
}: BottomSheetProps) {
  const colors = useTheme();

  const closedPosition = screenHeight - 100; // Only header visible
  const openPosition = screenHeight * 0.1; // 90% of screen

  const translateY = useRef(new Animated.Value(closedPosition)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const scaleYAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [currentIcon, setCurrentIcon] = useState(
    require("../assets/AppIconCircle.png")
  );

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (isOpen) {
        closeSheet();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isOpen]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(isOpen);
  }, [isOpen, onStateChange]);

  useEffect(() => {
    Animated.spring(scaleYAnim, {
      toValue: isOpen ? -1 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    // Gira y desvanece
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Cambia el ícono
      setCurrentIcon(
        isOpen
          ? require("../assets/AppIconCircle.png")
          : require("../assets/ExpensesIcon.png")
      );

      // Reinicia rotación y vuelve a mostrar
      rotateAnim.setValue(0);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [isOpen]);

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: openPosition,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        delay: 100, // Small delay for smoother transition
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(true);
    });
  }, [
    translateY,
    backdropOpacity,
    contentOpacity,
    openPosition,
    headerOpacity,
  ]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: closedPosition,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  }, [
    translateY,
    backdropOpacity,
    contentOpacity,
    closedPosition,
    headerOpacity,
  ]);

  const toggleSheet = () => {
    if (isOpen) {
      closeSheet();
    } else {
      openSheet();
    }
  };

  // Simple pan responder for basic drag functionality
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newValue = isOpen
          ? openPosition + gestureState.dy
          : closedPosition + gestureState.dy;

        // Constrain movement
        if (newValue >= openPosition && newValue <= closedPosition) {
          translateY.setValue(newValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = screenHeight * 0.3;

        if (isOpen) {
          if (gestureState.dy > threshold || gestureState.vy > 0.5) {
            closeSheet();
          } else {
            openSheet();
          }
        } else {
          if (gestureState.dy < -threshold || gestureState.vy < -0.5) {
            openSheet();
          } else {
            closeSheet();
          }
        }
      },
    })
  ).current;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const animatedStyle = {
    transform: [{ rotate }],
    opacity: opacityAnim,
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            backgroundColor: colors.overlay || "rgba(0,0,0,0.5)",
          },
        ]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={closeSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
            backgroundColor: colors.bgPrimary,
            shadowColor: colors.primaryText,
          },
        ]}
      >
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <TouchableOpacity
          onPress={toggleSheet}
          style={styles.header}
          activeOpacity={0.8}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[styles.headerContent, { opacity: headerOpacity }]}
          >
            <Animated.Image
              source={currentIcon}
              style={[styles.icon, animatedStyle]}
            />
            <Text style={[styles.title, { color: colors.yellow }]}>
              {isOpen ? title : closedTitle}
            </Text>
            <Animated.Image
              source={require("../assets/ArrowIcon.png")}
              style={[styles.icon, { transform: [{ scaleY: scaleYAnim }] }]}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    boxShadow: `0 -1px 6px #94a3b8`,
    zIndex: 2,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    fontSize: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  arrow: {
    fontSize: 16,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: "80%", // ajusta a lo que necesites
  },
  scrollContent: {
    paddingBottom: 32,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
