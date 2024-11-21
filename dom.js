
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

	Plotly.newPlot(PR, [{x: r, y: p, name: 'classifier 2'}, {x: [], y: [], name: 'classifier 1'}], {
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

	Plotly.newPlot(ROC, [{x: fnr, y: tpr, name: 'classifier 2'}, {x: [], y: [], name: 'classifier 1'}], {
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

    for (const sample of all_samples) {
        const metrics_ = metrics(sample, positive_samples, negative_samples);
        p.push(metrics_.precision);
        r.push(metrics_.recall);
    }

    return { p, r };
}

function replot_pr() {
    const pr1 = compute_pr(positive_samples, negative_samples);
    const pr2 = compute_pr(positive_samples_2, negative_samples_2);

    Plotly.restyle(PR, {x: [pr1.r], y: [pr1.p]}, [0]);
    Plotly.restyle(PR, {x: [pr2.r], y: [pr2.p]}, [1]);
}

function replot_roc_ (){
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

	Plotly.restyle(ROC, {x: [fnr], y: [tpr]},[0]);
}

function compute_roc(positive_samples, negative_samples) {
    const tpr = [];
    const fpr = [];
    const all_samples = positive_samples.concat(negative_samples);
    all_samples.push(0);
    all_samples.sort((a, b) => a - b);

    const n = positive_samples.length;

    for (const sample of all_samples) {
        const metrics_ = metrics(sample, positive_samples, negative_samples);
        tpr.push(metrics_.tp / n);  // True positive rate
        fpr.push(metrics_.fp / n);  // False positive rate
    }

    return { tpr, fpr };
}

// Function to plot both ROC curves
function replot_roc() {
    const roc1 = compute_roc(positive_samples, negative_samples);
    const roc2 = compute_roc(positive_samples_2, negative_samples_2);

    Plotly.restyle(ROC, {x: [roc1.fpr], y: [roc1.tpr]}, [0]);  
    Plotly.restyle(ROC, {x: [roc2.fpr], y: [roc2.tpr]}, [1]); 
}


function addRandomNoise(arr, maxNoise) {
        return arr.map(cell => cell + Math.random() * maxNoise);
}

function regenerate_samples (){
    positive_samples = generateSample(-1.0, 0.90);
    negative_samples = generateSample(0.8, 0);
    positive_samples_2 = addRandomNoise (positive_samples, max_noise);
    negative_samples_2 = addRandomNoise (negative_samples, -max_noise);
    
}

let max_noise = 0.4;
const n = 70;
let threshold = 0.8;
const n_range = createRange(0, n);

positive_samples = generateSample(-0.8, 0.90);
negative_samples = generateSample(0.7, 0);
positive_samples_2 = addRandomNoise (positive_samples, max_noise);
negative_samples_2 = addRandomNoise (negative_samples, -max_noise);
regenerate_samples ();
const PR = document.querySelector('#PR');
const ROC = document.querySelector('#ROC');
const samples = document.querySelector('#samples');
plot_pr();
plot_roc();
plot_samples(threshold);
replot_samples(0.8);
document.querySelector('#samples').on('plotly_sliderchange', eventData => {
	const sliderValue = eventData.step.args[0];
	replot_samples(sliderValue);
    threshold = sliderValue;
});
document.querySelector('#samples').on('plotly_buttonclicked', eventData => {
    regenerate_samples();
    replot_roc();
    replot_pr ();
    replot_samples(threshold);
});

