
function generate_samples(mean, development) {
	return Array.from({length: n}, () => mean + development * Math.random());
}

function generateSample(c1, c2) {
	const uniform = Array.from({length: n}, () => Math.random() ** 2);
	const sample = [];
	for (const element of uniform) {
		sample.push(c1 * element ** 2 + c2);
	}

	return sample;
}

function createRange(start, end) {
	return Array.from({length: end - start + 1}, (_, i) => start + i);
}

function metrics(threshold, positive, negative) {
	let tp = 0;
	let fp = 0;
	let function_ = 0;
	for (const element of positive) {
		if (element >= threshold) {
			tp++;
		} else {
			function_++;
		}
	}

	for (const element of negative) {
		if (element >= threshold) {
			fp++;
		}
	}

	return {
		precision: tp / (tp + fp || 1), recall: tp / (tp + function_ || 1), tp, fp, fn: function_,
	};
}

function plot_pr() {
	// This is greedy and unoptimal I KNOW, why don't you ask chatgpt to recode it ?
	const p = [];
	const r = [];
	const all_samples = positive_samples.concat(negative_samples);
	all_samples.push(0);
	all_samples.sort((a, b) => a - b);

	for (const sample of all_samples) {
		metrics_ = metrics(sample, positive_samples, negative_samples);

		p.push(metrics_.precision);
		r.push(metrics_.recall);
	}

	Plotly.newPlot(PR, [{x: r, y: p, name: 'classifier 1', marker:{size:10}}, {x: [], y: [], name: 'classifier 2', marker:{size:10}},{x: [], y: [], marker:{size:10},name: 'classifier 3'},{x:[], y:[], line:{color:'grey', dash:'dash'}}], {
		margin: {t: 0}, title: 'Precision-Recall Curve',
		xaxis: {title: 'Recall', range: [0, 1.05]},
		yaxis: {title: 'Precision', range: [0, 1.1]},
	},{displayModeBar: false});
    replot_pr();
}

function plot_roc() {
    
	const tpr = [];
	const fnr = [];
	const all_samples = positive_samples.concat(negative_samples);
	all_samples.push(0);
	all_samples.sort((a, b) => a - b);

	for (const sample of all_samples) {
		metrics_ = metrics(sample, positive_samples, negative_samples);

		tpr.push(metrics_.tp / n);
		fnr.push(metrics_.fp / n);
	}

	Plotly.newPlot(ROC, [{x: fnr, y: tpr, name: 'classifier 1',marker:{size:10}}, {x: [], y: [], name: 'classifier 2',marker:{size:10}},{x: [], y: [], name: 'classifier 3',marker:{size:10}}, {x:[], y:[], line:{color:'grey', dash:'dash'}}], {
		title: 'ROC curve',
		xaxis: {title: 'False Positive Rate (FPR)', range: [0, 1.05]},
		yaxis: {title: 'True Positive Rate (TPR)', range: [0, 1.1]}, margin: {t: 0},
	},{displayModeBar: false});
    replot_roc();
    
}
function replot_pr_ (){
	const p = [];
	const r = [];
	const all_samples = positive_samples.concat(negative_samples);
	all_samples.push(0);
	all_samples.sort((a, b) => a - b);

	for (const sample of all_samples) {
		metrics_ = metrics(sample, positive_samples, negative_samples);

		p.push(metrics_.precision);
		r.push(metrics_.recall);
	}

	Plotly.restyle(PR, {x: [r], y: [p]},[0]);
    replot_pr ();

}

function compute_pr(positive_samples, negative_samples) {
    const p = [];
    const r = [];
    const all_samples = positive_samples.concat(negative_samples);
    all_samples.push(0);
    all_samples.sort((a, b) => a - b);

    const metrics_ = metrics(threshold, positive_samples, negative_samples);
    p.push(metrics_.precision);
    r.push(metrics_.recall);

    return { p, r };
}

function replot_pr() {
    const pr1 = compute_pr(positive_samples, negative_samples);
    const pr2 = compute_pr(positive_samples_2, negative_samples_2);

    Plotly.restyle(PR, {x: [pr1.r], y: [pr1.p]}, [0]);
    Plotly.restyle(PR, {x: [pr2.r], y: [pr2.p]}, [1]);
    

    const m1 = compute_roc(positive_samples, negative_samples);
    const m2 = compute_roc(positive_samples_2, negative_samples_2);

    let tprs = [];
    let precisions = [];
    for (let i = 0; i <= 100; i++){
        let mix = i/100
        tpr_ = m1.tpr[0] + mix * (m2.tpr[0] - m1.tpr[0]); 
        fpr_ = m1.fpr[0] + mix * (m2.fpr[0] - m1.fpr[0]); 

        precision = (tpr_ * p_split) / (tpr_*p_split + fpr_*(1-p_split))
        tprs.push (tpr_);
        precisions.push (precision)
    }
    Plotly.restyle (PR, {x: [tprs],y: [precisions]}, [3]);
}

function replot_roc_ (){
	const tpr = [];
	const fnr = [];
	const all_samples = positive_samples.concat(negative_samples);
	all_samples.push(0);
	all_samples.sort((a, b) => a - b);

    metrics_ = metrics(threshold, positive_samples, negative_samples);

    tpr.push(metrics_.tp / n);
    fnr.push(metrics_.fp / n);

	Plotly.restyle(ROC, {x: [fnr], y: [tpr]},[0]);
}

function compute_roc(positive_samples, negative_samples) {
    const tpr = [];
    const fpr = [];
    const all_samples = positive_samples.concat(negative_samples);
    all_samples.push(0);
    all_samples.sort((a, b) => a - b);

    const n = positive_samples.length;

    const metrics_ = metrics(threshold, positive_samples, negative_samples);
    tpr.push(metrics_.tp / n);  // True positive rate
    fpr.push(metrics_.fp / n);  // False positive rate

    return { tpr, fpr };
}

// Function to plot both ROC curves
function replot_roc() {
    const roc1 = compute_roc(positive_samples, negative_samples);
    const roc2 = compute_roc(positive_samples_2, negative_samples_2);

    Plotly.restyle(ROC, {x: [roc1.fpr], y: [roc1.tpr]}, [0]);  
    Plotly.restyle(ROC, {x: [roc2.fpr], y: [roc2.tpr]}, [1]); 

    let tprs = [];
    let fprs = [];
    for (let i = 0; i <= 100; i++){
        let mix = i/100
        tpr_ = roc1.tpr[0] + mix * (roc2.tpr[0] - roc1.tpr[0]); 
        fpr_ = roc1.fpr[0] + mix * (roc2.fpr[0] - roc1.fpr[0]); 
        fprs.push (fpr_);
        tprs.push (tpr_);
    }
    Plotly.restyle (ROC, {x: [fprs],y: [tprs]}, [3]);
}


function addRandomNoise(arr, maxNoise) {
        return arr.map(cell => cell + Math.random() * maxNoise);
}
function plot_mixture (){
    const roc1 = compute_roc(positive_samples, negative_samples);
    const roc2 = compute_roc(positive_samples_2, negative_samples_2);
    tpr_ = roc1.tpr[0] + mixture * (roc2.tpr[0] - roc1.tpr[0]); 
    fpr_ = roc1.fpr[0] + mixture * (roc2.fpr[0] - roc1.fpr[0]); 
    precision = (tpr_ * p_split) / (tpr_*p_split + fpr_*(1-p_split))
    Plotly.restyle(ROC, {x: [[fpr_]] , y: [[tpr_]]}, [2]); 
    Plotly.restyle(PR, {x: [[tpr_]] , y: [[precision]]}, [2]); 
}
function regenerate_samples (){
    positive_samples = generateSample(-1.0, 0.90);
    negative_samples = generateSample(0.8, 0);
    positive_samples_2 = addRandomNoise (positive_samples, max_noise);
    negative_samples_2 = addRandomNoise (negative_samples, -max_noise);
    
}
let p_split = 1/2;
let max_noise = 0.4;
const n = 70;
let threshold = 0.7;
const n_range = createRange(0, n);

positive_samples = generateSample(-0.8, 0.90);
negative_samples = generateSample(0.7, 0);
positive_samples_2 = addRandomNoise (positive_samples, max_noise);
negative_samples_2 = addRandomNoise (negative_samples, -max_noise);
regenerate_samples ();

positive_samples = [0.9,0.8,0.9,0.9,0.9,0.8, 1, 1, 1, 1, 1, 1];
negative_samples = [0.75,0.75,0.75,0.75,0,0,0, 0, 0.8, 0.8, 0.8, 0.8];

positive_samples_2  = [0.8,0.8,0.5,0.5,0.4,0.5,0.5, 1, 1, 1, 1, 1];
negative_samples_2 = [0.05,0.05,0.075,0.075,0,0.075,0.8, 0,0,0,0,0];
const PR = document.querySelector('#PR');

const ROC = document.querySelector('#ROC');
const samples = document.querySelector('#samples');
const  idd = document.querySelector ("#p");
plot_pr();
plot_roc();
const mix = document.querySelector("#mix");
mix.addEventListener("input", (event) => {
    mixture = event.target.value/100;
    plot_mixture();
    idd.textContent = mixture;
});
let mixture = 0.5; 
plot_mixture();

