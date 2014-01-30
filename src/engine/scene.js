/**
    @module scene
    @namespace game
**/
game.module(
    'engine.scene',
    '1.0.0'
)
.body(function(){ 'use strict';

/**
    @class Scene
    @extends game.Class
**/
game.Scene = game.Class.extend({
    /**
        @property {Number} backgroundColor
    **/
    backgroundColor: 0x000000,
    /**
        @property {Array} objects
    **/
    objects: [],
    /**
        @property {Array} timers
    **/
    timers: [],
    /**
        @property {Array} tweens
    **/
    tweens: [],
    /**
        @property {Array} emitters
    **/
    emitters: [],
    /**
        Main container for scene.
        @property {game.Container} stage
    **/
    stage: null,
    
    staticInit: function() {
        game.scene = this;
        
        for (var i = game.system.stage.children.length - 1; i >= 0; i--) {
            game.system.stage.removeChild(game.system.stage.children[i]);
        }

        game.system.stage.setBackgroundColor(this.clearColor || this.backgroundColor);

        game.system.stage.mousemove = game.system.stage.touchmove = this.mousemove.bind(this);
        game.system.stage.click = game.system.stage.tap = this.click.bind(this);
        game.system.stage.mousedown = game.system.stage.touchstart = this.mousedown.bind(this);
        game.system.stage.mouseup = game.system.stage.mouseupoutside = game.system.stage.touchend = game.system.stage.touchendoutside = this.mouseup.bind(this);
        game.system.stage.mouseout = this.mouseout.bind(this);

        this.stage = new game.Container();
        game.system.stage.addChild(this.stage);
    },
    
    /**
        This is called every frame.
        @method update
    **/
    update: function(){
        var i;
        if(this.world) this.world.update();
        for (i = this.timers.length - 1; i >= 0; i--) {
            if(this.timers[i].delta() >= 0) {
                if(typeof(this.timers[i].callback) === 'function') this.timers[i].callback();
                this.timers.erase(this.timers[i]);
            }
        }
        for (i = this.emitters.length - 1; i >= 0; i--) {
            this.emitters[i].update();
            if(this.emitters[i]._remove) this.emitters.erase(this.emitters[i]);
        }
        for (i = this.tweens.length - 1; i >= 0; i--) {
            this.tweens[i].update();
            if(this.tweens[i].complete) this.tweens.erase(this.tweens[i]);
        }
        for (i = this.objects.length - 1; i >= 0; i--) {
            this.objects[i].update();
            if(this.objects[i]._remove) this.objects.erase(this.objects[i]);
        }
    },

    addObject: function(object) {
        this.objects.push(object);
    },

    removeObject: function(object) {
        object._remove = true;
    },

    /**
        Helper function for {{#crossLink "game.Tween"}}{{/crossLink}}
        @method addTween
        @param {Object} obj
        @param {Object} props
        @param {Number} duration
        @param {Object} [settings]
    **/
    addTween: function(obj, props, duration, settings) {
        var tween = new game.Tween(obj, props, duration, settings);
        this.tweens.push(tween);
        return tween;
    },

    /**
        @method getTween
        @param {Object} obj
    **/
    getTween: function(obj) {
        for (var i = 0; i < this.tweens.length; i++) {
            if(this.tweens[i]._object === obj) return this.tweens[i];
        }
        return false;
    },

    /**
        @method stopTweens
        @param {Object} [obj]
        @param {Boolean} [doComplete]
    **/
    stopTweens: function(obj, doComplete) {
        for (var i = 0; i < this.tweens.length; i++) {
            if(obj && this.tweens[i]._object === obj || !obj) this.tweens[i].stop(doComplete);
        }
    },

    /**
        @method pauseTweens
        @param {Object} [obj]
    **/
    pauseTweens: function(obj) {
        for ( var i = 0; i < this.tweens.length; i++ ) {
            if(obj && this.tweens[i]._object === obj || !obj) this.tweens[i].pause();
        }
    },

    /**
        @method resumeTweens
        @param {Object} [obj]
    **/
    resumeTweens: function (obj) {
        for ( var i = 0; i < this.tweens.length; i++ ) {
            if(obj && this.tweens[i]._object === obj || !obj) this.tweens[i].resume();
        }
    },

    /**
        Add timer to game scene.
        @method addTimer
        @param {Number} time Time in seconds
        @param {Function} callback Callback function to run, when timer ends.
    **/
    addTimer: function(time, callback) {
        var timer = new game.Timer(time);
        timer.callback = callback;
        this.timers.push(timer);
    },
    
    /**
        Callback for mouse click and touch tap on the scene stage.
        @method click
        @param {InteractionData} InteractionData
    **/
    click: function() {},

    /**
        Callback for mousedown and touchstart on the scene stage.
        @method mousedown
        @param {InteractionData} InteractionData
    **/
    mousedown: function() {},

    /**
        Callback for mouseup and touchend on the scene stage.
        @method mouseup
        @param {InteractionData} InteractionData
    **/
    mouseup: function() {},

    /**
        Callback for mousemove and touchmove on the scene stage.
        @method mousemove
        @param {InteractionData} InteractionData
    **/
    mousemove: function() {},

    /**
        Callback for mouseout on the scene stage.
        @method mouseout
        @param {InteractionData} InteractionData
    **/
    mouseout: function() {},

    run: function() {
        this.update();
        this.render();
    },

    render: function(){
        game.renderer.render(game.system.stage);
    },

    pause: function() {
        game.sound.muteAll();
    },

    resume: function() {
        game.sound.unmuteAll();
    }
});

});