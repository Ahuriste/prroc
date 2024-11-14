
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

	Plotly.newPlot(PR, [{x: r, y: p, name: 'Precision/Recall'}, {x: [], y: [], name: ''}], {
		margin: {t: 0}, title: 'Precision-Recall Curve',
		xaxis: {title: 'Recall', range: [0, 1.05]},
		yaxis: {title: 'Precision', range: [0, 1.1]},
	},{displayModeBar: false});
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

	Plotly.newPlot(ROC, [{x: fnr, y: tpr, name: 'ROC values'}, {x: [], y: [], name: ''}], {
		title: 'ROC curve',
		xaxis: {title: 'False Positive Rate (FPR)', range: [0, 1.05]},
		yaxis: {title: 'True Positive Rate (TPR)', range: [0, 1.1]}, margin: {t: 0},
	},{displayModeBar: false});
}
function replot_pr (){
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
}
function replot_roc (){
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

function plot_samples(threshold) {
	Plotly.newPlot(samples,
		[{
			y: Array.from({length: n}).fill(0), x: negative_samples, type: 'scatter', mode: 'markers', name: 'Negative samples', marker: {size: 6},
		}, {
			y: Array.from({length: n}).fill(1), x: positive_samples, type: 'scatter', mode: 'markers', name: 'Positive samples', marker: {size: 6},
		}, {
			x: [threshold, threshold], y: [0, 1.5], type: 'line', marker: {size: 1}, name: 'Threshold',
		}],
		{
            xaxis: {range: [0, 1], title: {text: 'system response', margin: {t:-60}}},
			yaxis: {title: 'Ground truth', range: [-0.2, 1.2]}, margin: {t: 0},
			sliders: [{
                pad: {t: 80, l:110, r:-70},
				currentvalue: {
					xanchor: 'right',
					prefix: 'threshold',
				},
				steps: Array.from({length: 101}, (_, i) => ({label: '', method: 'skip', args: [i / 100]})),
				active: 80,
			}],
            updatemenus: [{
                pad: {t: 100 },
                    type: 'buttons',
                    xanchor: 'left',
                    yanchor: 'top',
                    x: 00,
                    y: 0,
                    direction: 'right',
                    buttons: [{
                              label: 'new samples',
                              method: 'skip',
                              args: []
                            }]
            }]
		, 
        }, {displayModeBar: false});
}

function replot_samples(threshold) {
	Plotly.restyle('samples', {x: [[threshold, threshold]], y: [[0, 1.5]]}, [2]);
	const metrics_ = metrics(threshold, positive_samples, negative_samples);
	Plotly.restyle('ROC', {
		x: [[metrics_.fp / n]], y: [[metrics_.tp / n]], mode: ['markers'], 'marker.size': [8], 'marker.color': ['red'],
		name: 'ROC@' + threshold,
	}, [1]);
	Plotly.restyle('PR', {
		y: [[metrics_.precision]], x: [[metrics_.recall]], mode: ['markers'], 'marker.size': [8], 'marker.color': ['red'],
		name: 'PR@' + threshold,
	}, [1]);
}

function regenerate_samples (){
    positive_samples = generateSample(-0.8, 0.90);
    negative_samples = generateSample(0.7, 0);
    Plotly.restyle('samples',{x:[negative_samples, positive_samples],y:[Array.from({length:n}).fill(0),Array.from({length:n}).fill(1)]},[0,1]);
    
}

const n = 70;
let threshold = 0.8;
const n_range = createRange(0, n);

positive_samples = generateSample(-0.8, 0.90);
negative_samples = generateSample(0.7, 0);
const PR = document.querySelector('#PR');
const ROC = document.querySelector('#ROC');
const samples = document.querySelector('#samples');
#plot_pr();
#plot_roc();
#plot_samples(threshold);
#replot_samples(0.8);
threshold = 0.7
positive_samples = [0.9,0.8,0.9,0.9,0.9,0.8];
negatives_samples = [0.75,0.75,0.75,0.75,0,0];

positive_samples_2  = [0.8,0.8,0.5,0.5,0.4,0.5];
negatives_samples_2 = [0.05,0.05,0.075,0.075,0,0.75];

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
