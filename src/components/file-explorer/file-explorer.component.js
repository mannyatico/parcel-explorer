import React from 'react';
import { Segment, Header, Icon, Grid, Divider, Label } from 'semantic-ui-react';
import './file-explorer.component.scss';
import ensure from '../../utils/ensure';

class FileExplorerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragActive: false,
            invalidFile: false,
            filename: '',
            filesize: ''
        };
    }

    handleFile(file) {
        if (file.length > 0) {
            const _file = file[0];
            let invalidFile = false;

            if (_file.type !== 'application/json') {
                invalidFile = true;
            }

            this.setState({
                invalidFile
            });

            if (!invalidFile) {
                this.setState({
                    filename: _file.name,
                    filesize: _file.size
                });
            }
        }
    }

    getHumanSize(bytes) {
        const _bytes = ensure.number(bytes);
        const multiples = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let nMultiple = 0;
        let nApprox = _bytes / 1024;
        let humanSize = '';

        for (nMultiple; nApprox > 1; nApprox /= 1024) {
            humanSize = `${nApprox.toFixed(3)} ${multiples[nMultiple]}`;
            nMultiple += 1;
        }

        return humanSize;
    }

    handleChange() {
        let selectedFile = document.getElementById('parcelsFile').files;
        this.handleFile(selectedFile);
    }

    handleDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            isDragActive: true
        });
    }

    handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        const dt = e.dataTransfer;
        const files = dt.files;

        this.setState({
            isDragActive: false
        });

        this.handleFile(files);
    }

    handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        let fileInfo = (
            <Label>
                <Icon name="warning circle" />
                No file provided
            </Label>
        );

        if (this.state.invalidFile) {
            fileInfo = (
                <Label color="yellow">
                    <Icon name="warning sign" />
                    The file provided is invalid, please select a valid json
                    file.
                </Label>
            );
        }

        if (!this.state.invalidFile && this.state.filename !== '') {
            fileInfo = (
                <Label color="teal">
                    <Icon name="file alternate outline" />
                    {this.state.filename} -{' '}
                    {this.getHumanSize(this.state.filesize)} (
                    {this.state.filesize} bytes)
                </Label>
            );
        }

        return (
            <Grid padded="vertically">
                <Grid.Column width="16">
                    <Segment
                        textAlign="center"
                        secondary
                        className={`${
                            this.state.isDragActive ? 'drag-active' : ''
                        }`}
                        onDragEnter={(e) => this.handleDragEnter(e)}
                        onDrop={(e) => this.handleDrop(e)}
                        onDragOver={(e) => this.handleDragOver(e)}
                    >
                        <Header icon>
                            <Icon name="upload" />
                            Drop your parcel's json file here
                            <Divider horizontal>or</Divider>
                            <input
                                type="file"
                                id="parcelsFile"
                                className="hiddenInput"
                                accept="application/JSON"
                                onChange={() => this.handleChange()}
                            />
                            <label htmlFor="parcelsFile">
                                browse a file from your computer
                            </label>
                        </Header>
                        <Divider horizontal>
                            <Header as="h5">
                                <Icon name="bar chart" />
                                File info
                            </Header>
                        </Divider>
                        <Header.Content>{fileInfo}</Header.Content>
                    </Segment>
                </Grid.Column>
            </Grid>
        );
    }
}

export default FileExplorerComponent;
