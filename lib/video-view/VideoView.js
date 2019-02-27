import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Picker
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video, {FilterType} from 'react-native-video';
import ToggleButton from '../toggle-button/ToggleButton';
import CaptionEditor from '../caption-editor/CaptionEditor';
import {Caption} from '../caption-editor/Caption';

import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
};


const filterTypes = [
    "NONE",
    "INVERT",
    "MONOCHROME",
    "POSTERIZE",
    "FALSE",
    "MAXIMUMCOMPONENT",
    "MINIMUMCOMPONENT",
    "CHROME",
    "FADE",
    "INSTANT",
    "MONO",
    "NOIR",
    "PROCESS",
    "TONAL",
    "TRANSFER",
    "SEPIA"
];


class VideoView extends Component {
    constructor(props){
        super(props);
        this.state = {
            cEditorEnabled: false,
            mute: false,
            text: "",
            color: "",
            filter: 'NONE',
            currentIndex: 0
        };
        this.caption = null;
        this.finishEditingCaption = this.finishEditingCaption.bind(this);
    }

    onCancel(){
        this.setState({text: "", color: ""});
        this.closeCaptionEditor();
        this.props.onCancel();
    }

    onLoad(){
        this.props.onLoad();
    }

    swipeRightLeft = (type) => {

        let {currentIndex} = this.state;

        if(type === 'left'){

            let updateIndex = currentIndex;

            if(filterTypes.length === updateIndex){

                updateIndex = 0

            } else {

              updateIndex = currentIndex + 1;

            }

            this.setState({filter: filterTypes[updateIndex], currentIndex: updateIndex})

        }
        else if (type === 'right') {

            let updateIndex = currentIndex;

            if(updateIndex === 0){

                updateIndex = filterTypes.length;

            } else {

                updateIndex = currentIndex - 1;

            }

            this.setState({filter: filterTypes[updateIndex], currentIndex : updateIndex})

        }
    };


    openCaptionEditor(){
        this.setState({cEditorEnabled: true});
    }

    closeCaptionEditor(){
        this.setState({cEditorEnabled: false});
    }

    finishEditingCaption(text,color){
        this.closeCaptionEditor();
        this.setState({text: text, color: color});
    }

    toggleMute(){
        this.setState({mute: !this.state.mute});
    }

    onSave(){
        this.props.onSave().then(()=>{}).catch((error)=>{});
    }

    onMultiClipMode(){
        this.props.onMultiClipMode();
    }

    onBack(){
        this.props.onBack();
    }

    onFilterChanged = (val) => {
        this.setState({filter: val})
    }


    onSubmit(){
        var caption = {text: this.state.text, color: this.state.color, offset: this.caption ? this.caption.getRelativeOffset() : .5};
        this.props.onSubmit(caption, this.state.mute);
    }



    renderVideo(){
        return (<TouchableWithoutFeedback disabled={!this.props.multiClipMode} onPress={this.onBack.bind(this)} style={styles.container}>
            <GestureRecognizer
                onSwipeLeft={(state) => this.swipeRightLeft('left')}
                onSwipeRight={(state) => this.swipeRightLeft('right')}
                config={config}
                style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    zIndex: 1
                }}
            >
                <Video
                    style={styles.video}
                    source={{uri: this.props.data}}
                    muted={this.state.mute}
                    repeat={true}
                    filter={FilterType[this.state.filter]}
                    filterEnabled={true}
                    playInBackground={false}
                    playWhenInactive={false}
                    ignoreSilentSwitch={"obey"}
                    resizeMode="cover"
                    onLoad={this.onLoad.bind(this)}>
                </Video>
            </GestureRecognizer>
        </TouchableWithoutFeedback>);
    }

    render(){
        if(this.props.data && !this.props.multiClipMode){
            return (
                <View style={this.props.style}>
                    <TouchableOpacity style={[styles.iconButton, styles.floatingTopLeftButton]} onPress={this.onCancel.bind(this)}>
                        <Icon name={"close"} size={34} color="#FFF"/>
                    </TouchableOpacity>
                    {this.state.cEditorEnabled ? null : <TouchableOpacity style={[styles.iconButton, styles.floatingBottomRightButton]} onPress={this.onSubmit.bind(this)}>
                        <Icon name={"send"} size={34} color="#FFF"/>
                    </TouchableOpacity>}
                    {this.state.cEditorEnabled ? null : <TouchableOpacity style={[styles.iconButton, styles.floatingBottomLeftButton]} onPress={this.onMultiClipMode.bind(this)}>
                        <Icon name={"vector-combine"} size={34} color="#FFF"/>
                    </TouchableOpacity>}
                    <View style={styles.toolBar}>
                        <TouchableOpacity style={styles.iconButton} onPress={this.openCaptionEditor.bind(this)}>
                            <Icon name={"format-text"} size={34} color="#FFF"/>
                        </TouchableOpacity>
                        <ToggleButton style={styles.iconButton}
                                      iconSize={34}
                                      color="#FFF"
                                      icon={"volume-high"}
                                      toggledIcon={"volume-off"}
                                      onPress={this.toggleMute.bind(this)}/>
                        <ToggleButton style={styles.iconButton}
                                      iconSize={34}
                                      color="#FFF"
                                      icon={"download"}
                                      toggledIcon={"checkbox-marked-circle-outline"}
                                      singleToggle={true}
                                      onPress={this.onSave.bind(this)}/>

                    </View>
                    <View style={styles.overlay}><Caption ref={(ref)=>{this.caption = ref}} onPress={this.openCaptionEditor.bind(this)} visible={!this.state.cEditorEnabled} lock={false} color={this.state.color} text={this.state.text}/></View>
                    <CaptionEditor onCancel={this.closeCaptionEditor.bind(this)} onFinish={this.finishEditingCaption} enabled={this.state.cEditorEnabled} style={styles.overlay}/>
                    {this.renderVideo()}
                </View>
            );
        }else if(this.props.data && this.props.multiClipMode){
            return (
                <View style={this.props.style}>
                    <TouchableOpacity style={[styles.iconButton, styles.floatingTopLeftButton]} onPress={this.onBack.bind(this)}>
                        <Icon name={"keyboard-arrow-left"} size={34} color="#FFF"/>
                    </TouchableOpacity>
                    <View style={styles.toolBar}>
                        <ToggleButton style={styles.iconButton}
                                      iconSize={34}
                                      color="#FFF"
                                      icon={"download"}
                                      toggledIcon={"checkbox-marked-circle-outline"}
                                      singleToggle={true}
                                      onPress={this.onSave.bind(this)}/>
                    </View>
                    {this.renderVideo()}

                </View>
            );
        }else {
            return null;
        }
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        flex: 1,
    },
    toolBar: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingTop: 15,
        width: 60,
        height: '25%',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    iconButton:{
        height: 50,
        width:50,
    },
    floatingTopLeftButton:{
        position: 'absolute',
        top: 0,
        left: 0,
        paddingLeft: 15,
        paddingTop: 15,
        zIndex: 2,
    },
    floatingBottomRightButton:{
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingRight: 15,
        paddingBottom: 15,
        zIndex: 2,
    },
    floatingBottomLeftButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        paddingLeft: 15,
        paddingBottom: 15,
        zIndex: 2,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
    }
});

VideoView.propTypes = {
    style: PropTypes.obj,
    multiClipMode: PropTypes.bool,
    data: PropTypes.string,
    muted: PropTypes.bool,
    onCancel: PropTypes.func,
    onLoad: PropTypes.func,
    onSave: PropTypes.func,
    onBack: PropTypes.func,
    onSubmit: PropTypes.func
}

VideoView.defaultProps = {
    multiClipMode: false,
    style: styles.container,
    data: null,
    muted: false,
    onCancel: () => {},
    onLoad: () => {},
    onSave: () => {},
    onBack: () => {},
    onSubmit: () => {}

};

export default VideoView;
