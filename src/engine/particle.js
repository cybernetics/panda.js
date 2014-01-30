/**
    Particle engine.

    @module particle
    @namespace game
**/
game.module(
    'engine.particle',
    '1.0.0'
)
.require(
    'engine.physics'
)
.body(function() {

/**
    @class Particle
    @extends game.Class
**/
game.Particle = game.Class.extend({
    /**
        @property {game.Vector} position
    **/
    position: null,
    /**
        @property {game.Vector} velocity
    **/
    velocity: null,
    /**
        @property {game.Sprite} sprite
    **/
    sprite: null,
    /**
        @property {game.Vector} accel
    **/
    accel: null,

    init: function() {
        this.position = new game.Vector();
        this.velocity = new game.Vector();
        this.accel = new game.Vector();
    },

    /**
        @method setVelocity
        @param {Number} angle
        @param {Number} speed
    **/
    setVeloctity: function(angle, speed) {
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
    },

    /**
        @method setAccel
        @param {Number} angle
        @param {Number} speed
    **/
    setAccel: function(angle, speed) {
        this.accel.x = Math.cos(angle) * speed;
        this.accel.y = Math.sin(angle) * speed;
    }
});

/**
    Particle emitter.

    __Example__

        var emitter = new game.Emitter();
        emitter.container = game.scene.stage;
        emitter.textures.push('media/particle.png');
        emitter.position.x = game.system.width / 2;
        emitter.position.y = game.system.height / 2;
        game.scene.emitters.push(emitter);

    @class Emitter
    @extends game.Class
    @constructor
    @param {Object} [settings]
**/
game.Emitter = game.Class.extend({
    /**
        Pool name for particles.
        @property {String} poolName
        @default emitter
    **/
    poolName: 'emitter',
    /**
        @property {Array} particles
    **/
    particles: [],
    /**
        List of texture paths.
        @property {Array} textures
    **/
    textures: [],
    /**
        Container for particle sprites.
        @property {game.Container} container
    **/
    container: null,
    /**
        @property {game.Vector} position
    **/
    position: null,
    /**
        @property {game.Vector} positionVar
    **/
    positionVar: null,
    /**
        Emit angle in radians.
        @property {Number} angle
        @default 0
    **/
    angle: 0,
    /**
        @property {Number} angleVar
        @default Math.PI
    **/
    angleVar: Math.PI,
    /**
        @property {Number} speed
        @default 100
    **/
    speed: 100,
    /**
        @property {Number} speedVar
        @default 0
    **/
    speedVar: 0,
    /**
        Particle's life in seconds.
        @property {Number} life
        @default 2
    **/
    life: 2,
    /**
        Particle's life variance.
        @property {Number} lifeVar
        @default 0
    **/
    lifeVar: 0,
    /**
        Emitter duration in seconds. 0 = forever
        @property {Number} duration
        @default 0
    **/
    duration: 0,
    durationTimer: 0,
    /**
        Emitter rate.
        @property {Number} rate
        @default 0.1
    **/
    rate: 0.1,
    rateTimer: 0,
    /**
        Emit count.
        @property {Number} count
        @default 10
    **/
    count: 10,
    /**
        @property {Boolean} active
        @default true
    **/
    active: true,
    /**
        Particle's velocity rotation speed.
        @property {Number} velRotate
        @default 0
    **/
    velRotate: 0,
    /**
        @property {Number} velRotateVar
        @default 0
    **/
    velRotateVar: 0,
    /**
        Particle's sprite rotation speed.
        @property {Number} rotate
        @default 0
    **/
    rotate: 0,
    /**
        @property {Number} rotateVar
        @default 0
    **/
    rotateVar: 0,
    /**
        @property {Number} startAlpha
        @default 1
    **/
    startAlpha: 1,
    /**
        @property {Number} endAlpha
        @default 0
    **/
    endAlpha: 0,
    /**
        @property {Number} startScale
        @default 1
    **/
    startScale: 1,
    /**
        @property {Number} startScaleVar
        @default 0
    **/
    startScaleVar: 0,
    /**
        @property {Number} endScale
        @default 1
    **/
    endScale: 1,
    /**
        @property {Number} endScaleVar
        @default 0
    **/
    endScaleVar: 0,
    /**
        Target position for particles.
        @property {game.Vector} target
    **/
    target: null,
    /**
        Target positions force.
        @property {Number} targetForce
        @default 0
    **/
    targetForce: 0,
    /**
        Acceleration angle in radians.
        @property {Number} accelAngle
        @default Math.PI / 2
    **/
    accelAngle: Math.PI / 2,
    /**
        @property {Number} accelAngleVar
        @default 0
    **/
    accelAngleVar: 0,
    /**
        Acceleration speed.
        @property {Number} accelSpeed
        @default 0
    **/
    accelSpeed: 0,
    /**
        @property {Number} accelSpeedVar
        @default 0
    **/
    accelSpeedVar: 0,
    /**
        Settings to apply on particle sprite.
        @property {Object} spriteSettings
    **/
    spriteSettings: {
        anchor: {x: 0.5, y: 0.5},
    },
    /**
        @property {game.Vector} velocityLimit
        @default 100
    **/
    velocityLimit: null,

    init: function(settings) {
        game.pool.create(this.poolName);
        this.position = new game.Vector();
        this.positionVar = new game.Vector();
        this.velocityLimit = new game.Vector(100, 100);
        this.target = new game.Vector();

        game.merge(this, settings);
    },

    /**
        Reset emitter values to defaults.
        @method reset
        @param {Boolean} resetVec Reset vector values.
    **/
    reset: function(resetVec) {
        for(var name in this) {
            if(typeof this[name] === 'number') {
                this[name] = game.Emitter.prototype[name];
            }
            if(this[name] instanceof game.Vector && resetVec) {
                this[name].set(0, 0);
            }
        }
    },

    /**
        @method getVariance
        @return {Number}
    **/
    getVariance: function(value) {
        return (Math.random() * value) * (Math.random() > 0.5 ? -1 : 1);
    },

    /**
        @method addParticle 
    **/
    addParticle: function() {
        var particle = game.pool.get(this.poolName);
        if(!particle) particle = new game.Particle();

        particle.position.x = this.position.x + this.getVariance(this.positionVar.x);
        particle.position.y = this.position.y + this.getVariance(this.positionVar.y);

        var angleVar = this.getVariance(this.angleVar);
        var angle = this.angle + angleVar;
        var speed = this.speed + this.getVariance(this.speedVar);

        particle.setVeloctity(angle, speed);

        if(this.angleVar != this.accelAngleVar) angleVar = this.getVariance(this.accelAngleVar);

        angle = this.accelAngle + angleVar;
        speed = this.accelSpeed + this.getVariance(this.accelSpeedVar);

        particle.setAccel(angle, speed);

        particle.life = Math.max(0, this.life + this.getVariance(this.lifeVar));

        if(!particle.sprite) {
            particle.sprite = new game.Sprite(particle.position.x, particle.position.y, this.textures.random(), this.spriteSettings);
        } else {
            particle.sprite.setTexture(game.TextureCache[this.textures.random()]);
        }

        particle.rotate = this.rotate + this.getVariance(this.rotateVar);
        particle.velRotate = this.velRotate + this.getVariance(this.velRotateVar);

        particle.deltaAlpha = this.endAlpha - this.startAlpha;
        particle.deltaAlpha /= particle.life;
        particle.sprite.alpha = this.startAlpha;

        var startScale = this.startScale + this.getVariance(this.startScaleVar);
        particle.deltaScale = (this.endScale + this.getVariance(this.endScaleVar)) - startScale;
        particle.deltaScale /= particle.life;
        particle.sprite.scale.x = particle.sprite.scale.y = startScale;

        if(this.container) this.container.addChild(particle.sprite);

        this.particles.push(particle);
    },

    /**
        @method updateParticle
    **/
    updateParticle: function(particle) {
        if(particle.life > 0) {
            particle.life -= game.system.delta;

            if(this.targetForce > 0) {
                particle.accel.set(this.target.x - particle.position.x, this.target.y - particle.position.y);
                particle.accel.normalize().multiply(this.targetForce);
            }

            particle.velocity.multiplyAdd(particle.accel, game.system.delta);
            particle.velocity.limit(this.velocityLimit);
            particle.velocity.rotate(particle.velRotate * game.system.delta);
            particle.position.multiplyAdd(particle.velocity, game.scale * game.system.delta);

            particle.sprite.alpha = Math.max(0, particle.sprite.alpha + particle.deltaAlpha * game.system.delta);
            particle.sprite.scale.x = particle.sprite.scale.y += particle.deltaScale * game.system.delta;
            particle.sprite.rotation += particle.rotate * game.system.delta;
            particle.sprite.position.x = particle.position.x;
            particle.sprite.position.y = particle.position.y;
        } else {
            if(particle.sprite.parent) particle.sprite.parent.removeChild(particle.sprite);
            game.pool.put(this.poolName, particle);
            this.particles.erase(particle);
        }
    },

    /**
        @method emit
        @param {Number} count
    **/
    emit: function(count) {
        count = count || 1;
        for (var i = 0; i < count; i++) {
            this.addParticle();
        }
    },

    /**
        @method update
    **/
    update: function() {
        this.durationTimer += game.system.delta;
        if(this.duration > 0) this.active = this.durationTimer < this.duration;

        if(this.rate && this.active) {
            this.rateTimer += game.system.delta;
            if(this.rateTimer >= this.rate) {
                this.rateTimer = 0;
                this.emit(this.count);
            }
        }

        for (var i = this.particles.length - 1; i >= 0; i--) {
            this.updateParticle(this.particles[i]);
        }
    },

    /**
        Remove emitter from scene.
        @method remove
    **/
    remove: function() {
        this._remove = true;
    }
});

});