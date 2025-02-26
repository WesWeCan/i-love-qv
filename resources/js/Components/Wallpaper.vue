<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { RepoD3Node, RepoD3Link } from '@/types/RepoD3Types';

class Link {
    source: { x: number; y: number };
    target: { x: number; y: number };
    prevSource: { x: number; y: number };
    prevTarget: { x: number; y: number };
    transitionProgress: number;

    constructor(source: {x: number, y: number}, target: {x: number, y: number}) {
        this.source = source;
        this.target = target;
        this.prevSource = {...source};
        this.prevTarget = {...target};
        this.transitionProgress = 1;
    }

    updatePositions(newSource: {x: number, y: number}, newTarget: {x: number, y: number}) {
        this.prevSource = {...this.source};
        this.prevTarget = {...this.target};
        this.source = newSource;
        this.target = newTarget;
        this.transitionProgress = 0;
    }

    draw(ctx: CanvasRenderingContext2D, transform: { k: number; x: number; y: number }) {
        const currentSource = {
            x: this.prevSource.x + (this.source.x - this.prevSource.x) * this.transitionProgress,
            y: this.prevSource.y + (this.source.y - this.prevSource.y) * this.transitionProgress
        };
        const currentTarget = {
            x: this.prevTarget.x + (this.target.x - this.prevTarget.x) * this.transitionProgress,
            y: this.prevTarget.y + (this.target.y - this.prevTarget.y) * this.transitionProgress
        };

        ctx.beginPath();
        ctx.moveTo(
            currentSource.x * transform.k + transform.x,
            currentSource.y * transform.k + transform.y
        );
        ctx.lineTo(
            currentTarget.x * transform.k + transform.x,
            currentTarget.y * transform.k + transform.y
        );
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (this.transitionProgress < 1) {
            this.transitionProgress += 0.05;
        }
    }
}

class Particle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    originX: number;
    originY: number;
    prevOriginX: number;
    prevOriginY: number;
    prevTargetX: number;
    prevTargetY: number;
    speed: number;
    progress: number;
    controlPoint: { x: number; y: number };
    trail: Array<{x: number, y: number; alpha: number}>;
    transitionProgress: number;
    isReversed: boolean;

    constructor(origin: {x: number, y: number}, target: {x: number, y: number}) {
        this.originX = this.prevOriginX = origin.x;
        this.originY = this.prevOriginY = origin.y;
        this.targetX = this.prevTargetX = target.x;
        this.targetY = this.prevTargetY = target.y;
        this.x = origin.x;
        this.y = origin.y;
        this.speed = 0.002 + Math.random() * 0.001;
        this.progress = Math.random();
        this.trail = [];
        this.transitionProgress = 1;
        this.isReversed = false;
        this.updateControlPoint();
    }

    updatePositions(newOrigin: {x: number, y: number}, newTarget: {x: number, y: number}) {
        const distToNewOrigin = Math.hypot(this.x - newOrigin.x, this.y - newOrigin.y);
        const distToNewTarget = Math.hypot(this.x - newTarget.x, this.y - newTarget.y);
        
        // If closer to target than origin, flip direction
        if (distToNewTarget < distToNewOrigin) {
            this.isReversed = !this.isReversed;
            [newOrigin, newTarget] = [newTarget, newOrigin];
        }

        this.prevOriginX = this.originX;
        this.prevOriginY = this.originY;
        this.prevTargetX = this.targetX;
        this.prevTargetY = this.targetY;
        this.originX = newOrigin.x;
        this.originY = newOrigin.y;
        this.targetX = newTarget.x;
        this.targetY = newTarget.y;
        this.transitionProgress = 0;
        this.updateControlPoint();
    }

    updateControlPoint() {
        const midX = (this.originX + this.targetX) / 2;
        const midY = (this.originY + this.targetY) / 2;
        const perpX = -(this.targetY - this.originY);
        const perpY = this.targetX - this.originX;
        const dist = Math.sqrt(perpX * perpX + perpY * perpY);
        const normalizedPerpX = perpX / dist;
        const normalizedPerpY = perpY / dist;
        const randomOffset = (Math.random() - 0.5) * 200;
        
        this.controlPoint = {
            x: midX + normalizedPerpX * randomOffset,
            y: midY + normalizedPerpY * randomOffset
        };
    }

    update() {
        if (this.transitionProgress < 1) {
            this.transitionProgress += 0.05;
        }

        this.progress += this.speed;
        if (this.progress >= 1) {
            this.progress = 0;
            this.x = this.originX;
            this.y = this.originY;
            this.trail = [];
            return;
        }

        const currentOriginX = this.prevOriginX + (this.originX - this.prevOriginX) * this.transitionProgress;
        const currentOriginY = this.prevOriginY + (this.originY - this.prevOriginY) * this.transitionProgress;
        const currentTargetX = this.prevTargetX + (this.targetX - this.prevTargetX) * this.transitionProgress;
        const currentTargetY = this.prevTargetY + (this.targetY - this.prevTargetY) * this.transitionProgress;

        const t = this.isReversed ? 1 - this.progress : this.progress;
        const mt = 1 - t;
        
        this.x = mt * mt * currentOriginX + 2 * mt * t * this.controlPoint.x + t * t * currentTargetX;
        this.y = mt * mt * currentOriginY + 2 * mt * t * this.controlPoint.y + t * t * currentTargetY;
        
        this.trail.push({x: this.x, y: this.y, alpha: 1.0});
        
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha = i / this.trail.length;
        }
        
        if (this.trail.length > 10) {
            this.trail.shift();
        }
    }
}

const props = defineProps<{
    nodes?: RepoD3Node[];
    links?: RepoD3Link[];
    transform?: { k: number; x: number; y: number };
}>();

const particlesCanvasRef = ref<HTMLCanvasElement>();
const metaballsCanvasRef = ref<HTMLCanvasElement>();
const circles = ref<Array<{ x: number; y: number; radius: number }>>();
const particles = ref<Particle[]>([]);
const linkLines = ref<Link[]>([]);
let animationFrameId: number;

const updateCircles = () => {
    if (!props.nodes) return;
    circles.value = props.nodes.map(node => ({
        x: node.x || 0,
        y: node.y || 0,
        radius: 50
    }));
};

const updateParticles = () => {
    if (!props.links) return;
    
    if (particles.value.length === 0) {
        particles.value = [];
        linkLines.value = [];
        props.links.forEach(link => {
            const source = { x: link.source.x || 0, y: link.source.y || 0 };
            const target = { x: link.target.x || 0, y: link.target.y || 0 };
            linkLines.value.push(new Link(source, target));
            for (let i = 0; i < 3; i++) {
                particles.value.push(new Particle(source, target));
            }
        });
    } else {
        props.links.forEach((link, i) => {
            const source = { x: link.source.x || 0, y: link.source.y || 0 };
            const target = { x: link.target.x || 0, y: link.target.y || 0 };
            
            if (linkLines.value[i]) {
                linkLines.value[i].updatePositions(source, target);
            }
            
            for (let j = 0; j < 3; j++) {
                const particleIndex = i * 3 + j;
                if (particles.value[particleIndex]) {
                    particles.value[particleIndex].updatePositions(source, target);
                }
            }
        });
    }
};

const drawMetaballs = () => {
    if (!metaballsCanvasRef.value || !props.transform || !circles.value) return;
    
    const ctx = metaballsCanvasRef.value.getContext('2d');
    if (!ctx) return;

    const { width, height } = metaballsCanvasRef.value;
    ctx.clearRect(0, 0, width, height);

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.fillStyle = '#fff';
    circles.value.forEach(circle => {
        offCtx.beginPath();
        offCtx.arc(
            circle.x * props.transform!.k + props.transform!.x,
            circle.y * props.transform!.k + props.transform!.y,
            circle.radius * props.transform!.k,
            0,
            Math.PI * 2
        );
        offCtx.fill();
    });

    const imageData = offCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const edges = ctx.createImageData(width, height);
    const edgesData = edges.data;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            const top = data[(y - 1) * width * 4 + x * 4] > 0;
            const bottom = data[(y + 1) * width * 4 + x * 4] > 0;
            const left = data[y * width * 4 + (x - 1) * 4] > 0;
            const right = data[y * width * 4 + (x + 1) * 4] > 0;
            const current = data[idx] > 0;

            if (current !== top || current !== bottom || current !== left || current !== right) {
                edgesData[idx] = 255;
                edgesData[idx + 1] = 0;
                edgesData[idx + 2] = 0;
                edgesData[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(edges, 0, 0);
};

const drawParticles = () => {
    if (!particlesCanvasRef.value || !props.transform) return;
    
    const ctx = particlesCanvasRef.value.getContext('2d');
    if (!ctx) return;

    const { width, height } = particlesCanvasRef.value;
    ctx.clearRect(0, 0, width, height);

    linkLines.value.forEach(line => line.draw(ctx, props.transform!));

    particles.value.forEach(particle => {
        particle.update();
        
        particle.trail.forEach((point) => {
            ctx.beginPath();
            ctx.arc(
                point.x * props.transform!.k + props.transform!.x,
                point.y * props.transform!.k + props.transform!.y,
                1.5 * props.transform!.k,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(0, 0, 255, ${point.alpha * 0.3})`;
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(
            particle.x * props.transform!.k + props.transform!.x,
            particle.y * props.transform!.k + props.transform!.y,
            2 * props.transform!.k,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
        ctx.fill();
    });
};

const draw = () => {
    drawMetaballs();
    drawParticles();
    animationFrameId = requestAnimationFrame(draw);
};

const resizeCanvas = () => {
    [particlesCanvasRef.value, metaballsCanvasRef.value].forEach(canvas => {
        if (!canvas) return;
        const container = canvas.parentElement;
        if (!container) return;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    });
};

watch(() => props.nodes, updateCircles, { deep: true });
watch(() => props.links, updateParticles, { deep: true });

onMounted(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    updateCircles();
    updateParticles();
    draw();
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas);
    cancelAnimationFrame(animationFrameId);
});
</script>

<template>
    <div class="wallpaper-container">
        <canvas ref="metaballsCanvasRef" class="wallpaper"></canvas>
        <canvas ref="particlesCanvasRef" class="wallpaper"></canvas>
    </div>
</template>

<style scoped>
.wallpaper-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

.wallpaper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>