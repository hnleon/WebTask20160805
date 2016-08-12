'use strict';

const React = require('react');
const client = require('./client');
const follow = require('./follow'); // function to hop multiple links by "rel"
const root = '/api';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
            fileStatistics: [],
            attributes: [],
            filesPerPage: 4,
            links: {},
            showLines: false,
            linesHref: 0,
            lineStatistics: [],
            linesPerPage: 25
        };
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
        this.onBackToFiles = this.onBackToFiles.bind(this);
        this.onDetails = this.onDetails.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	loadFiles(perPage) {
		follow(client, root, [{rel: 'fileStatistics', params: {size: perPage}}]).then(fileStatisticCollection => {
			return client({
				method: 'GET',
				path: fileStatisticCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				return fileStatisticCollection;
			});
		}).done(fileStatisticCollection => {
			this.setState({
				fileStatistics: fileStatisticCollection.entity._embedded.fileStatistics,
				attributes: Object.keys(this.schema.properties),
				filesPerPage: perPage,
				links: fileStatisticCollection.entity._links
            });
		});
	}

    loadLines(perPage) {
        var rel = this.state.linesHref.substring(this.state.linesHref.indexOf(root) + root.length + 1);
		follow(client, root, [{rel: 'lineStatistics', params: {size: perPage, fileId: this.state.fileId}}]).then(lineStatisticCollection => {
//        follow(client, root, [{rel: rel,params: {size: perPage}}]).then(lineStatisticCollection => {
			return client({
				method: 'GET',
				path: lineStatisticCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				return lineStatisticCollection;
			});
		}).done(lineStatisticCollection => {
			this.setState({
				lineStatistics: lineStatisticCollection.entity._embedded.lineStatistics,
				attributes: Object.keys(this.schema.properties),
				linesPerPage: perPage,
				links: lineStatisticCollection.entity._links
            });
		});
	}

	onCreate(newFileStatistic) {
		follow(client, root, ['fileStatistics']).then(fileStatisticCollection => {
			return client({
				method: 'POST',
				path: fileStatisticCollection.entity._links.self.href,
				entity: newFileStatistic,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [{rel: 'fileStatistics', params: {'size': this.state.filesPerPage}}]);
		}).done(response => {
            if ("last" in response.entity._links) {
                this.onNavigate(response.entity._links.last.href);
            } else {
                this.loadFiles(this.state.filesPerPage);
            }
		});
	}

    onBackToFiles() {
        this.state.showLines = false;
        this.loadFiles(this.state.filesPerPage);
    }

    onDetails(fileStatistic) {
        this.state.linesHref = fileStatistic._links.lines.href;
        this.state.showLines = true;
        this.loadLines(this.state.linesPerPage);
//        client({method: 'GET', path: fileStatistic._links.lines.href}).done(response => {
//            this.loadLines(this.state.linesPerPage);
//		});
	}

	onDelete(fileStatistic) {
		client({method: 'DELETE', path: fileStatistic._links.self.href}).done(response => {
			this.loadFiles(this.state.filesPerPage);
		});
	}

	onNavigate(navUri) {
        if (this.state.showLines) {
            client({method: 'GET', path: navUri}).done(lineStatisticCollection => {
                this.setState({
                    lineStatistics: lineStatisticCollection.entity._embedded.lineStatistics,
                    attributes: this.state.attributes,
                    linesPerPage: this.state.linesPerPage,
                    links: lineStatisticCollection.entity._links
                });
            });
            return;
        }
		client({method: 'GET', path: navUri}).done(fileStatisticCollection => {
			this.setState({
				fileStatistics: fileStatisticCollection.entity._embedded.fileStatistics,
				attributes: this.state.attributes,
				filesPerPage: this.state.filesPerPage,
				links: fileStatisticCollection.entity._links
			});
		});
	}

	updatePageSize(filesPerPage) {
		if (filesPerPage !== this.state.filesPerPage) {
			this.loadFiles(filesPerPage);
		}
	}

	componentDidMount() {
		this.loadFiles(this.state.filesPerPage);
	}

	render() {
        if (this.state.showLines) {
            return (
                <div>
                    <LineStatisticList
                            lineStatistics={this.state.lineStatistics}
                            links={this.state.links}
                            linesPerPage={this.state.linesPerPage}
                            onNavigate={this.onNavigate}
                            onBackToFiles={this.onBackToFiles} />
                </div>
            )
        }
		return (
			<div>
				<FileStatisticList
                        fileStatistics={this.state.fileStatistics}
                        links={this.state.links}
                        filesPerPage={this.state.filesPerPage}
                        onNavigate={this.onNavigate}
                        onDetails={this.onDetails}
                        onDelete={this.onDelete}
                        updatePageSize={this.updatePageSize} />
                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
			</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newFileStatistic = {};
		this.props.attributes.forEach(attribute => {
//            if ("lines" === attribute) {
//                return;
//            }
			newFileStatistic[attribute] = React.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newFileStatistic);

		// clear out the dialog's inputs
		this.props.attributes.forEach(attribute => {
//            if ("lines" === attribute) {
//                return;
//            }
			React.findDOMNode(this.refs[attribute]).value = '';
		});

		// Navigate away from the dialog to hide it.
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(function(attribute, i) {
//            if ("lines" === attribute) {
//                return;
//            }
            return (
                <p key={attribute}>
                    <input type="text" placeholder={attribute} ref={attribute} className="field" />
                </p>
            )
        });

		return (
			<div>
				<a href="#createFileStatistic">Create File Statistic Record</a>

				<div id="createFileStatistic" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new fileStatistic</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

}

class FileStatisticList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	handleInput(e) {
		e.preventDefault();
		var filesPerPage = React.findDOMNode(this.refs.filesPerPage).value;
		if (/^[0-9]+$/.test(filesPerPage)) {
			this.props.updatePageSize(filesPerPage);
		} else {
			React.findDOMNode(this.refs.filesPerPage).value = filesPerPage.substring(0, filesPerPage.length - 1);
		}
	}

	handleNavFirst(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

    render() {
		var fileStatistics = this.props.fileStatistics.map(fileStatistic =>
			<FileStatistic key={fileStatistic._links.self.href} fileStatistic={fileStatistic}
                    onDetails={this.props.onDetails} onDelete={this.props.onDelete} />
		);

		var navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>First</button>);
		} else {
            navLinks.push(<button key="first" disabled="disabled" onClick={this.handleNavFirst}>First</button>);
        }
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		} else {
            navLinks.push(<button key="prev" disabled="disabled" onClick={this.handleNavPrev}>&lt;</button>);
        }
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		} else {
            navLinks.push(<button key="next" disabled="disabled" onClick={this.handleNavNext}>&gt;</button>);
        }
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>Last</button>);
		} else {
            navLinks.push(<button key="last" disabled="disabled" onClick={this.handleNavLast}>Last</button>);
        }

		return (
			<div>
				<table>
					<thead><tr>
						<th style={{width: 200}}>File Name</th>
						<th>Longest Word</th>
						<th>Shortest Word</th>
                        <th>Avarage Word</th>
                        <th>Line Length</th>
                        <th>Actions</th>
					</tr></thead><tbody>
                        {fileStatistics}
                    </tbody>
				</table>
                <div>
                    <div className="page_size_container">
                        <label hacktmlFor="page_size">Page Size</label>
                        <input id="page_size" ref="filesPerPage" defaultValue={this.props.filesPerPage} onInput={this.handleInput}/>
                    </div>
                    <div className="navigation_container">
                        {navLinks}
                    </div>
                </div>
			</div>
		)
	}
}

class LineStatisticList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
        this.handleToFiles = this.handleToFiles.bind(this);
	}

	handleNavFirst(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}

	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}

	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}

	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}

    handleToFiles(e) {
		e.preventDefault();
		this.props.onBackToFiles();
	}

    render() {
		var lineStatistics = this.props.lineStatistics.map(lineStatistic =>
			<LineStatistic key={lineStatistic._links.self.href} lineStatistic={lineStatistic}
                    onBackToFiles={this.props.onBackToFiles} />
		);

		var navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>First</button>);
		} else {
            navLinks.push(<button key="first" disabled="disabled" onClick={this.handleNavFirst}>First</button>);
        }
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		} else {
            navLinks.push(<button key="prev" disabled="disabled" onClick={this.handleNavPrev}>&lt;</button>);
        }
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		} else {
            navLinks.push(<button key="next" disabled="disabled" onClick={this.handleNavNext}>&gt;</button>);
        }
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>Last</button>);
		} else {
            navLinks.push(<button key="last" disabled="disabled" onClick={this.handleNavLast}>Last</button>);
        }

        var ctrlLinks = [];
        ctrlLinks.push(<button key="backToFiles" onClick={this.handleToFiles}>Back to Files</button>);

		return (
			<div>
				<table>
					<thead><tr>
						<th>Longest Word</th>
						<th>Shortest Word</th>
                        <th>Avarage Word</th>
                        <th>Line Length</th>
					</tr></thead><tbody>
                        {lineStatistics}
                    </tbody>
				</table>
                <div>
                    <div className="page_size_container">
                        {ctrlLinks}
                    </div>
                    <div className="navigation_container">
                        {navLinks}
                    </div>
                </div>
			</div>
		)
	}
}

class FileStatistic extends React.Component {

	constructor(props) {
		super(props);
        this.handleDetails = this.handleDetails.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

    handleDetails() {
		this.props.onDetails(this.props.fileStatistic);
	}

	handleDelete() {
		this.props.onDelete(this.props.fileStatistic);
	}

	render() {
		return (
			<tr>
				<td>{this.props.fileStatistic.fileName}</td>
				<td>{this.props.fileStatistic.longestWord}</td>
				<td>{this.props.fileStatistic.shortestWord}</td>
                <td>{this.props.fileStatistic.averageWord}</td>
                <td>{this.props.fileStatistic.lineLength}</td>
				<td>
                    <button onClick={this.handleDetails}>Lines</button>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}

class LineStatistic extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<tr>
				<td>{this.props.lineStatistic.longestWord}</td>
				<td>{this.props.lineStatistic.shortestWord}</td>
                <td>{this.props.lineStatistic.averageWord}</td>
                <td>{this.props.lineStatistic.lineLength}</td>
			</tr>
		)
	}
}

React.render(<App />, document.getElementById('react'))
