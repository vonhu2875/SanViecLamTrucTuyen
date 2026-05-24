import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { Button, Icon } from 'react-native-paper';
import Styles from '../../styles/Styles';
import { COLORS } from '../../constants/Colors';
// Data 3 slides 
import { onboardingSlides } from '../../utils/data';

const { width, height } = Dimensions.get('window');

const Onboarding = ({ navigation }) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const ref = useRef(null);

    const updateCurrentSlideIndex = (e) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);
    };

    const goToNextSlide = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex != onboardingSlides.length) {
            const offset = nextSlideIndex * width;
            ref?.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(nextSlideIndex);
        }
    };

    const skip = () => {
        const lastSlideIndex = onboardingSlides.length - 1;
        const offset = lastSlideIndex * width;
        ref?.current?.scrollToOffset({ offset });
        setCurrentSlideIndex(lastSlideIndex);
    };

    const renderItem = ({ item }) => {
        return (
            <View style={{ width, padding: 20, paddingTop: height * 0.1 }}> 
                <View style={Styles.fancyIllustrationContainer}>
                    <View style={Styles.iconBgGlow}>
                        <Icon source={item.icon} size={height * 0.15} color={COLORS.primary} />
                    </View>
                </View>
                
                <View style={Styles.onboardingTextCtn}>
                    <Text style={Styles.onboardingTitle}>{item.title}</Text>
                    <Text style={Styles.onboardingDesc}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF0F2' }}>
            <FlatList
                ref={ref}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={onboardingSlides}
                pagingEnabled
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />

            {/* Chấm tròn */}
            <View style={Styles.indicatorContainer}>
                {onboardingSlides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            Styles.indicator,
                            currentSlideIndex === index && {
                                backgroundColor: COLORS.primary,
                                width: 25,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Khu vực Nút bấm: Giữ nguyên logic */}
            <View style={Styles.onboardingBottom}>
                {currentSlideIndex === onboardingSlides.length - 1 ? (
                    <View style={{ height: 50 }}>
                        <Button 
                            mode="contained" 
                            buttonColor={COLORS.primary} 
                            style={Styles.onboardingButton}
                            onPress={() => navigation.replace('login')}
                        >
                            Bắt đầu ngay
                        </Button>
                    </View>
                ) : (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                            mode="text" 
                            textColor={COLORS.textLighter} 
                            onPress={skip}
                        >
                            Bỏ qua
                        </Button>
                        <Button 
                            mode="contained" 
                            buttonColor={COLORS.primary} 
                            style={Styles.onboardingButtonShort}
                            onPress={goToNextSlide}
                        >
                            Tiếp tục
                        </Button>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Onboarding;