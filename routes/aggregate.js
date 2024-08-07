const express = require('express');
const ExportData = require('../models/exports'); // Assuming this is the model for ExportData
const ShipmentName = require('../models/shipmentName'); // Assuming this is the model for ShipmentName
const aggregationRouter = express.Router();

// Map for country to continent
const countryToContinent = {
    'BURKINA FASO': 'Africa',
    'PARAGUAY': 'South America',
    'BAHRAIN': 'Asia',
    'ARUBA': 'North America',
    'TAJIKISTAN': 'Asia',
    'FRENCH POLYNESIA': 'Oceania',
    'CYPRUS': 'Europe',
    'DOMINICA': 'North America',
    'AUSTRIA': 'Europe',
    'GEORGIA': 'Asia',
    'SAUDI ARABIA': 'Asia',
    'VIETNAM, DEMOCRATIC REP. OF': 'Asia',
    'MADAGASCAR': 'Africa',
    'ERITREA': 'Africa',
    'UZBEKISTAN': 'Asia',
    'VENEZUELA': 'South America',
    'TANZANIA': 'Africa',
    'SPAIN': 'Europe',
    'THAILAND': 'Asia',
    'POLAND': 'Europe',
    'MAURITIUS': 'Africa',
    'COLOMBIA': 'South America',
    'GUADELOUPE': 'North America',
    'KYRGHYSTAN': 'Asia',
    'MICRONESIA': 'Oceania',
    'KIRIBATI': 'Oceania',
    'BURUNDI': 'Africa',
    'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 'Africa',
    'BENIN': 'Africa',
    'PUERTO RICO': 'North America',
    'ETHIOPIA': 'Africa',
    'BAHAMAS': 'North America',
    'MARSHALL ISLANDS': 'Oceania',
    'AFGHANISTAN': 'Asia',
    'PANAMA': 'North America',
    'AZARBAIJAN': 'Asia',
    'NEW CALEDONIA': 'Oceania',
    'VANUATU': 'Oceania',
    'PALAU': 'Oceania',
    'SWITZERLAND': 'Europe',
    'CONGO': 'Africa',
    'LUXEMBOURG': 'Europe',
    'GREECE': 'Europe',
    'AUSTRALIA': 'Oceania',
    'KUWAIT': 'Asia',
    'SURINAM': 'South America',
    'TURKS & CAICOS ISLANDS': 'North America',
    'PERU': 'South America',
    'NICARAGUA': 'North America',
    'HUNGARY': 'Europe',
    'BELIZE': 'North America',
    'CAPE VERDE ISLANDS': 'Africa',
    'EGYPT': 'Africa',
    'NORWAY': 'Europe',
    'GABON': 'Africa',
    'FIJI': 'Oceania',
    'CAMBODIA': 'Asia',
    'BOTSWANA': 'Africa',
    'SUDAN': 'Africa',
    'EQUATORIAL GUINEA': 'Africa',
    'PAPUA NEW GUINEA': 'Oceania',
    'COSTA RICA': 'North America',
    'COMOROS': 'Africa',
    'GAUTEMALA': 'North America',
    'GHANA': 'Africa',
    'KENYA': 'Africa',
    'GERMANY': 'Europe',
    'NIGER': 'Africa',
    'DJIBOUTI': 'Africa',
    'QATAR': 'Asia',
    'MOROCCO': 'Africa',
    'PAKISTAN': 'Asia',
    'YEMEN, DEMOCRATIC': 'Asia',
    'IRELAND': 'Europe',
    'SERBIA': 'Europe',
    'RUSSIA': 'Europe',
    'BULGARIA': 'Europe',
    'JORDAN': 'Asia',
    'SOUTH SUDAN': 'Africa',
    'KAZAKISTAN': 'Asia',
    'FRENCH GUYANA': 'South America',
    'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF': 'Asia',
    'SAO TOME AND PRINCIPE': 'Africa',
    'ST LUCIA': 'North America',
    'PHILIPPINES': 'Asia',
    'TURKMENISTAN': 'Asia',
    'MONGOLIA': 'Asia',
    'COTE D IVOIRE': 'Africa',
    'CHAD': 'Africa',
    'ESTONIA': 'Europe',
    'BRUNEI': 'Asia',
    'ANGOLA': 'Africa',
    'IRAQ': 'Asia',
    'UNITED STATES MINOR OUTLAYING ISLANDS': 'Oceania',
    'SOMAALIA': 'Africa',
    'MARTINIQUE': 'North America',
    'ISRAEL': 'Asia',
    'NETHERLANDS': 'Europe',
    'GAMBIA': 'Africa',
    'URUGAY': 'South America',
    'BELARUS': 'Europe',
    'CHINA': 'Asia',
    'TONGA': 'Oceania',
    'UNITED KINGDOM': 'Europe',
    'LEBANON': 'Asia',
    'SRI LANKA': 'Asia',
    'INDONESIA': 'Asia',
    'MALAYSIA': 'Asia',
    'NEW ZEALAND': 'Oceania',
    'ARGENTINA': 'South America',
    'HONDURAS': 'North America',
    'SLOVENIA': 'Europe',
    'SLOVAK REPUBLIC': 'Europe',
    'OMAN': 'Asia',
    'CENTRAL AFRICAN REPUBLIC': 'Africa',
    'COCOS (KEELING ISLANDS)': 'Oceania',
    'MOLDOVA, REPUBLIC OF': 'Europe',
    'ST VINCENT': 'North America',
    'TURKEY': 'Asia',
    'GRENADA': 'North America',
    'ROMANIA': 'Europe',
    'DOMINICAN REPUBLIC': 'North America',
    'TRINIDAD & TOBAGO': 'North America',
    'SINGAPORE': 'Asia',
    'IRAN': 'Asia',
    'FINLAND': 'Europe',
    'MALTA': 'Europe',
    'ZIMBABWE': 'Africa',
    'TAIWAN': 'Asia',
    'GUINEA BISSAU': 'Africa',
    'SIERRA LEONE': 'Africa',
    'FRANCE': 'Europe',
    'SWAZILAND': 'Africa',
    'PALESTINE STATE': 'Asia',
    'SOLOMON ISLANDS': 'Oceania',
    'BELGIUM': 'Europe',
    'TOGO': 'Africa',
    'KOREA,REPUBLIC OF': 'Asia',
    'TUNISIA': 'Africa',
    'GUYANA': 'South America',
    'SENEGAL': 'Africa',
    'HAITI': 'North America',
    'BARBADOS': 'North America',
    'ZAMBIA': 'Africa',
    'UNITED ARAB EMIRATES': 'Asia',
    'SOUTH AFRICA': 'Africa',
    'CAMEROON': 'Africa',
    'CHILE': 'South America',
    'DENMARK': 'Europe',
    'MALI': 'Africa',
    'CZECH REPUBLIC': 'Europe',
    'BOSNIA & HERZEGOVINA': 'Europe',
    'ST KITTS-NEVIS-ANGUILLA': 'North America',
    'TIMOR LESTE': 'Asia',
    'UKRAINE': 'Europe',
    'LATVIA': 'Europe',
    'MONTENEGRO': 'Europe',
    'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF': 'Europe',
    'CUBA': 'North America',
    'ALBANIA': 'Europe',
    'MAYOTTE': 'Africa',
    'MEXICO': 'North America',
    'GUINEA': 'Africa',
    'HONG KONG': 'Asia',
    'JAPAN': 'Asia',
    'LIBERIA': 'Africa',
    'SWEDEN': 'Europe',
    'EL SALVADOR': 'North America',
    'SEYCHELLES': 'Africa',
    'LIBYAN ARAB REPUBLIC': 'Africa',
    'MALAWI': 'Africa',
    'REUNION': 'Africa',
    'BOLIVIA': 'South America',
    'SAMOA': 'Oceania',
    'CAYMAN ISLANDS': 'North America',
    'MAURITANIA': 'Africa',
    'NAMIBIA': 'Africa',
    'MYANMAR': 'Asia',
    'LITHUANIA': 'Europe',
    'SYRIA': 'Asia',
    'ITALY': 'Europe',
    'NIGERIA': 'Africa',
    'ALGERIA': 'Africa',
    'JAMAICA': 'North America',
    'PORTUGAL': 'Europe',
    'MALDIVES': 'Asia',
    'NETHERLANDS ANTILLES': 'North America',
    'UGANDA': 'Africa',
    'ICELAND': 'Europe',
    'UNITED STATES': 'North America',
    'CANADA': 'North America',
    'BRAZIL': 'South America',
    'ECUADOR': 'South America',
    'CROATIA': 'Europe',
    'RWANDA': 'Africa',
    'ARMENIA': 'Asia',
    'MOZAMBIQUE': 'Africa',
    'ANTIGUA': 'North America',
    'BANGLADESH': 'Asia',
};

// Helper function to calculate fetchedData
const calculateFetchedData = (monthWiseShipments) => {
    return monthWiseShipments.reduce((total, shipment) => total + shipment.count, 0);
};

// Helper function to format month
const formatMonth = (sbDate) => {
    const [day, month, year] = sbDate.split('-');
    return `${year}-${month}`;
};

// POST endpoint to aggregate and store data
aggregationRouter.post('/api/aggregateExportData', async (req, res) => {
    try {
        const aggregatedData = await ExportData.aggregate([
            {
                $addFields: {
                    month: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: {
                                $dateFromString: { dateString: { $concat: [{ $arrayElemAt: [{ $split: ["$sbDate", "-"] }, 2] }, "-", { $arrayElemAt: [{ $split: ["$sbDate", "-"] }, 1] }, "-01"] } }
                            }
                        }
                    },
                    continent: {
                        $ifNull: [{ $arrayElemAt: [{ $objectToArray: countryToContinent }[0], 1] }, "Unknown"]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        exporterName: '$exporterName',
                        month: '$month',
                        continent: '$continent'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.exporterName',
                    monthWiseShipments: {
                        $push: {
                            month: '$_id.month',
                            count: '$count'
                        }
                    },
                    topExportContinents: {
                        $push: {
                            continent: '$_id.continent',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $project: {
                    exporterName: '$_id',
                    monthWiseShipments: 1,
                    topExportContinents: 1
                }
            }
        ]);

        // Calculate fetchedData and percentage for topExportContinents
        const shipmentData = aggregatedData.map(data => {
            const fetchedData = calculateFetchedData(data.monthWiseShipments);
            const totalCount = data.topExportContinents.reduce((acc, continent) => acc + continent.count, 0);
            const topExportContinents = data.topExportContinents.map(continent => ({
                ...continent,
                percentage: ((continent.count / totalCount) * 100).toFixed(2)
            }));
            return {
                exporterName: data.exporterName,
                monthWiseShipments: data.monthWiseShipments,
                fetchedData,
                topExportContinents
            };
        });

        // Insert the aggregated data into ShipmentName collection
        await ShipmentName.deleteMany({});
        const savedData = await ShipmentName.insertMany(shipmentData);

        res.status(201).send(savedData);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = aggregationRouter;
