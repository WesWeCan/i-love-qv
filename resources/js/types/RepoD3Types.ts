import * as d3 from 'd3';
import * as ParticleTypes from '@/types/particles';


export interface SubWindowNode {
    id: string,
    name: string,
    color: string,
    particleData: ParticleTypes.Particle,
    x: number,
    y: number,
}



export interface SubWindowLink {
    source: string,
    target: string,
}



export interface SubWindowData {
    nodes: SubWindowNode[],
    links: SubWindowLink[],
}

export interface RepoD3Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    color: string;
    particleData: ParticleTypes.Particle;
    radius? : number;
}



export interface RepoD3Link extends d3.SimulationLinkDatum<RepoD3Node> {
    source: string | RepoD3Node;
    target: string | RepoD3Node;
    distance?: number;
    color?: string;
    thickness?: number;
}

export interface RepoD3SimulationDatum {
    index: number;
    source: RepoD3Node;
    target: RepoD3Node;
}


export interface RepoD3Options {

    svgID: string;

    zoom?: {
        enabled: boolean;
        scaleExtent: [number, number];
    },

    simulation?: {
        enabled: boolean;
    },

    standardRadius?: number;
    standardRadiusContent?: number;


}


export interface RepoD3Context {

    windowPosition: "subWindow" | "mainWindow";
    searchQuery: string;
    showContent: boolean;
    // contributor?: ParticleTypes.Creator;


}
