const express = require('express');
const soapReq = require('easy-soap-request');
const { ensure } = require('./utils/commonJS');
const { transform } = require('camaro');
const app = express();
const port = 3001;

const url = 'https://wsbeta.fedex.com:443/web-services/track';
const headers = {
    'Content-Type': 'text/xml;charset=UTF-8'
};

const defaultSOAPResponse = Object.freeze({
    response: {
        headers: {},
        body: {},
        statusCode: 418
    }
});
let defaultJSONResp = {
    result: 'ERROR',
    resultMsg: '',
    canRetry: true
};

const timeout = 2000;

const userKey = 'jfjwKS65xft8r8mh';
const userPwd = 'QYrbniTyMafyj4LXm4tV7nsq5'
const accNumber = '802388543';
const meterNumber = '119147906';
let trackingNumber = '';
let envelope;

function getEnvelope(userKey, userPwd, accountNumber, meterNumber, parcelID) {
    userKey = ensure.string(userKey);
    userPwd = ensure.string(userPwd);
    accountNumber = ensure.string(accountNumber);
    meterNumber = ensure.string(meterNumber);
    parcelID = ensure.string(parcelID);

    return (
        `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v18="http://fedex.com/ws/track/v18">
    <soapenv:Header/>
    <soapenv:Body>
        <v18:TrackRequest>
            <v18:WebAuthenticationDetail>
                <v18:UserCredential>
                <v18:Key>${userKey}</v18:Key>
                <v18:Password>${userPwd}</v18:Password>
                </v18:UserCredential>
            </v18:WebAuthenticationDetail>
            <v18:ClientDetail>
                <v18:AccountNumber>${accountNumber}</v18:AccountNumber>
                <v18:MeterNumber>${meterNumber}</v18:MeterNumber>
            </v18:ClientDetail>
            <!--Optional:-->
            <v18:TransactionDetail>
                <!--Optional:-->
                <v18:CustomerTransactionId>Track By Number_v18</v18:CustomerTransactionId>
                <!--Optional:-->
                <v18:Localization>
                <v18:LanguageCode>EN</v18:LanguageCode>
                <!--Optional:-->
                <v18:LocaleCode>US</v18:LocaleCode>
                </v18:Localization>
            </v18:TransactionDetail>
            <v18:Version>
                <v18:ServiceId>trck</v18:ServiceId>
                <v18:Major>18</v18:Major>
                <v18:Intermediate>0</v18:Intermediate>
                <v18:Minor>0</v18:Minor>
            </v18:Version>
            <!--Zero or more repetitions:-->
            <v18:SelectionDetails>
                <!--Optional:-->
                <v18:CarrierCode>FDXE</v18:CarrierCode>
                <!--Optional:-->
                <v18:PackageIdentifier>
                <v18:Type>TRACKING_NUMBER_OR_DOORTAG</v18:Type>
                <v18:Value>${parcelID}</v18:Value>
                </v18:PackageIdentifier>

                <!--Optional:-->
                <v18:ShipmentAccountNumber/>
                <!--Optional:-->
                <v18:SecureSpodAccount></v18:SecureSpodAccount>
                <!--Optional:-->
                </v18:SelectionDetails>
        </v18:TrackRequest>
    </soapenv:Body>
    </soapenv:Envelope>
    `
    );
};

const template = {
    result: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/Notification/Severity',
    resultMsg: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/Notification/LocalizedMessage',
    canRetry: 'boolean(false)',
    parcelDetails: {
        packageDimensions: {
            length: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/PackageDimensions/Length',
            width: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/PackageDimensions/Width',
            height: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/PackageDimensions/Height',
            units: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/PackageDimensions/Units'
        },
        shipmentWeight: {
            weight: 'number(/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/ShipmentWeight/Value)',
            units: '/SOAP-ENV:Envelope/SOAP-ENV:Body/TrackReply/CompletedTrackDetails/TrackDetails/ShipmentWeight/Units'
        }
    }
};

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.send('What are you doing here?');
});

app.get('/parcel/:parcelID', (req, res) => {
    trackingNumber = ensure.string(req.params.parcelID);
    console.log(`Requesting info for tracking number: ${trackingNumber}`);
    envelope = getEnvelope(userKey, userPwd, accNumber, meterNumber, trackingNumber);

    (async () => {
        let response;
        let result;

        try {
            response = await soapReq({ url, headers, xml: envelope, timeout });
        } catch (e) {
            Object.assign(defaultJSONResp, { resultMsg: e.message })
            response = defaultSOAPResponse;
        }
        const { headers: hdrs, body, statusCode } = response.response;

        if (statusCode === 200) {
            try {
                result = await transform(body, template);
            } catch (e) {
                Object.assign(defaultJSONResp, { resultMsg: e.message });
                result = defaultJSONResp;
            }
        } else {
            result = defaultJSONResp;
        }
        res.set('Content-Type', 'application/json');
        res.type('json');
        res.send(result);
    })();
})

app.listen(port, () => console.log(`Server running on port ${port}`));
