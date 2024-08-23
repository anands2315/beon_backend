// const express = require('express');
// const ExportData = require('../models/exports');
// const ShipmentHSN = require('../models/shipmentHSN');
// const aggregationRouter = express.Router();

// const countryToContinent = {
//     'BURKINA FASO': 'Africa',
//     'PARAGUAY': 'South America',
//     'BAHRAIN': 'Asia',
//     'ARUBA': 'North America',
//     'TAJIKISTAN': 'Asia',
//     'FRENCH POLYNESIA': 'Oceania',
//     'CYPRUS': 'Europe',
//     'DOMINICA': 'North America',
//     'AUSTRIA': 'Europe',
//     'GEORGIA': 'Asia',
//     'SAUDI ARABIA': 'Asia',
//     'VIETNAM, DEMOCRATIC REP. OF': 'Asia',
//     'MADAGASCAR': 'Africa',
//     'ERITREA': 'Africa',
//     'UZBEKISTAN': 'Asia',
//     'VENEZUELA': 'South America',
//     'TANZANIA': 'Africa',
//     'SPAIN': 'Europe',
//     'THAILAND': 'Asia',
//     'POLAND': 'Europe',
//     'MAURITIUS': 'Africa',
//     'COLOMBIA': 'South America',
//     'GUADELOUPE': 'North America',
//     'KYRGHYSTAN': 'Asia',
//     'MICRONESIA': 'Oceania',
//     'KIRIBATI': 'Oceania',
//     'BURUNDI': 'Africa',
//     'CONGO, THE DEMOCRATIC REPUBLIC OF THE': 'Africa',
//     'BENIN': 'Africa',
//     'PUERTO RICO': 'North America',
//     'ETHIOPIA': 'Africa',
//     'BAHAMAS': 'North America',
//     'MARSHALL ISLANDS': 'Oceania',
//     'AFGHANISTAN': 'Asia',
//     'PANAMA': 'North America',
//     'AZARBAIJAN': 'Asia',
//     'NEW CALEDONIA': 'Oceania',
//     'VANUATU': 'Oceania',
//     'PALAU': 'Oceania',
//     'SWITZERLAND': 'Europe',
//     'CONGO': 'Africa',
//     'LUXEMBOURG': 'Europe',
//     'GREECE': 'Europe',
//     'AUSTRALIA': 'Oceania',
//     'KUWAIT': 'Asia',
//     'SURINAM': 'South America',
//     'TURKS & CAICOS ISLANDS': 'North America',
//     'PERU': 'South America',
//     'NICARAGUA': 'North America',
//     'HUNGARY': 'Europe',
//     'BELIZE': 'North America',
//     'CAPE VERDE ISLANDS': 'Africa',
//     'EGYPT': 'Africa',
//     'NORWAY': 'Europe',
//     'GABON': 'Africa',
//     'FIJI': 'Oceania',
//     'CAMBODIA': 'Asia',
//     'BOTSWANA': 'Africa',
//     'SUDAN': 'Africa',
//     'EQUATORIAL GUINEA': 'Africa',
//     'PAPUA NEW GUINEA': 'Oceania',
//     'COSTA RICA': 'North America',
//     'COMOROS': 'Africa',
//     'GAUTEMALA': 'North America',
//     'GHANA': 'Africa',
//     'KENYA': 'Africa',
//     'GERMANY': 'Europe',
//     'NIGER': 'Africa',
//     'DJIBOUTI': 'Africa',
//     'QATAR': 'Asia',
//     'MOROCCO': 'Africa',
//     'PAKISTAN': 'Asia',
//     'YEMEN, DEMOCRATIC': 'Asia',
//     'IRELAND': 'Europe',
//     'SERBIA': 'Europe',
//     'RUSSIA': 'Europe',
//     'BULGARIA': 'Europe',
//     'JORDAN': 'Asia',
//     'SOUTH SUDAN': 'Africa',
//     'KAZAKISTAN': 'Asia',
//     'FRENCH GUYANA': 'South America',
//     'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF': 'Asia',
//     'SAO TOME AND PRINCIPE': 'Africa',
//     'ST LUCIA': 'North America',
//     'PHILIPPINES': 'Asia',
//     'TURKMENISTAN': 'Asia',
//     'MONGOLIA': 'Asia',
//     'COTE D IVOIRE': 'Africa',
//     'CHAD': 'Africa',
//     'ESTONIA': 'Europe',
//     'BRUNEI': 'Asia',
//     'ANGOLA': 'Africa',
//     'IRAQ': 'Asia',
//     'UNITED STATES MINOR OUTLAYING ISLANDS': 'Oceania',
//     'SOMAALIA': 'Africa',
//     'MARTINIQUE': 'North America',
//     'ISRAEL': 'Asia',
//     'NETHERLANDS': 'Europe',
//     'GAMBIA': 'Africa',
//     'URUGAY': 'South America',
//     'BELARUS': 'Europe',
//     'CHINA': 'Asia',
//     'TONGA': 'Oceania',
//     'UNITED KINGDOM': 'Europe',
//     'LEBANON': 'Asia',
//     'SRI LANKA': 'Asia',
//     'INDONESIA': 'Asia',
//     'MALAYSIA': 'Asia',
//     'NEW ZEALAND': 'Oceania',
//     'ARGENTINA': 'South America',
//     'HONDURAS': 'North America',
//     'SLOVENIA': 'Europe',
//     'SLOVAK REPUBLIC': 'Europe',
//     'OMAN': 'Asia',
//     'CENTRAL AFRICAN REPUBLIC': 'Africa',
//     'COCOS (KEELING ISLANDS)': 'Oceania',
//     'MOLDOVA, REPUBLIC OF': 'Europe',
//     'ST VINCENT': 'North America',
//     'TURKEY': 'Asia',
//     'GRENADA': 'North America',
//     'ROMANIA': 'Europe',
//     'DOMINICAN REPULIC': 'North America',
//     'TRINIDAD & TOBAGO': 'North America',
//     'SINGAPORE': 'Asia',
//     'IRAN': 'Asia',
//     'FINLAND': 'Europe',
//     'MALTA': 'Europe',
//     'ZIMBABWE': 'Africa',
//     'TAIWAN': 'Asia',
//     'GUINEA BISSAU': 'Africa',
//     'SIERRA LEONA': 'Africa',
//     'FRANCE': 'Europe',
//     'SWAZILAND': 'Africa',
//     'PALESTINE STATE': 'Asia',
//     'SOLOMON ISLANDS': 'Oceania',
//     'BELGIUM': 'Europe',
//     'TOGO': 'Africa',
//     'KOREA,REPUBLIC OF': 'Asia',
//     'TUNISIA': 'Africa',
//     'GUYANA': 'South America',
//     'SENEGAL': 'Africa',
//     'HAITI': 'North America',
//     'BARBADOS': 'North America',
//     'ZAMBIA': 'Africa',
//     'UNITED ARAB EMIRATES': 'Asia',
//     'SOUTH AFRICA': 'Africa',
//     'CAMEROON': 'Africa',
//     'CHILE': 'South America',
//     'DENMARK': 'Europe',
//     'MALI': 'Africa',
//     'CZECH REPUBLIC': 'Europe',
//     'BOSNIA & HERZEGOVINA': 'Europe',
//     'ST KITTS-NEVIS-ANGUILLA': 'North America',
//     'TIMOR LESTE': 'Asia',
//     'UKRAINE': 'Europe',
//     'LATVIA': 'Europe',
//     'MONTENEGRO': 'Europe',
//     'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF': 'Europe',
//     'CUBA': 'North America',
//     'ALBANIA': 'Europe',
//     'MAYOTTE': 'Africa',
//     'MEXICO': 'North America',
//     'GUINEA': 'Africa',
//     'HONG KONG': 'Asia',
//     'JAPAN': 'Asia',
//     'LIBERIA': 'Africa',
//     'SWEDEN': 'Europe',
//     'EL SALVADOR': 'North America',
//     'SEYCHELLES': 'Africa',
//     'LIBYAN ARAB REPUBLIC': 'Africa',
//     'MALAWI': 'Africa',
//     'REUNION': 'Africa',
//     'BOLIVIA': 'South America',
//     'SAMOA': 'Oceania',
//     'CAYMAN ISLANDS': 'North America',
//     'MAURITANIA': 'Africa',
//     'NAMIBIA': 'Africa',
//     'MYANMAR': 'Asia',
//     'LITHUANIA': 'Europe',
//     'SYRIA': 'Asia',
//     'ITALY': 'Europe',
//     'NIGERIA': 'Africa',
//     'ALGERIA': 'Africa',
//     'JAMAICA': 'North America',
//     'PORTUGAL': 'Europe',
//     'MALDIVES': 'Asia',
//     'NETHERLANDS ANTILLES': 'North America',
//     'UGANDA': 'Africa',
//     'ICELAND': 'Europe',
//     'UNITED STATES': 'North America',
//     'CANADA': 'North America',
//     'BRAZIL': 'South America',
//     'ECUADOR': 'South America',
//     'CROATIA': 'Europe',
//     'RWANDA': 'Africa',
//     'ARMENIA': 'Asia',
//     'MOZAMBIQUE': 'Africa',
//     'ANTIGUA': 'North America',
//     'BANGLADESH': 'Asia',
// };

// const calculateFetchedData = (monthWiseShipments) => {
//     return monthWiseShipments.reduce((total, shipment) => total + shipment.count, 0);
// };

// const getContinent = (country) => {
//     const trimmedCountry = country.trim().toUpperCase();
//     const continent = countryToContinent[trimmedCountry];
//     if (!continent) {
//         console.warn(`Continent mapping not found for country: ${trimmedCountry}`);
//     }
//     return continent || 'Unknown';
// };

// aggregationRouter.post('/api/aggregateHSNData', async (req, res) => {
//     try {
//         const aggregatedData = await ExportData.aggregate([
//             {
//                 $addFields: {
//                     month: {
//                         $dateToString: {
//                             format: "%Y-%m",
//                             date: {
//                                 $dateFromString: { dateString: { $concat: [{ $arrayElemAt: [{ $split: ["$sbDate", "-"] }, 2] }, "-", { $arrayElemAt: [{ $split: ["$sbDate", "-"] }, 1] }, "-01"] } }
//                             }
//                         }
//                     },
//                     continent: {
//                         $switch: {
//                             branches: Object.keys(countryToContinent).map(country => ({
//                                 case: { $eq: [{ $toUpper: "$countryOfDestination" }, country] },
//                                 then: countryToContinent[country]
//                             })),
//                             default: 'Unknown'
//                         }
//                     },
//                     ritcCode: "$ritcCode" // Adapt this to your RITC code field
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         ritcCode: '$ritcCode',
//                         month: '$month',
//                         continent: '$continent',
//                         countryOfDestination: '$countryOfDestination' // Added for top contributors
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$_id.ritcCode',
//                     monthWiseShipments: {
//                         $push: {
//                             month: '$_id.month',
//                             count: '$count'
//                         }
//                     },
//                     topExportContinents: {
//                         $push: {
//                             continent: '$_id.continent',
//                             count: '$count',
//                             countryOfDestination: '$_id.countryOfDestination' // Included for top contributors
//                         }
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     ritcCode: '$_id',
//                     monthWiseShipments: 1,
//                     topExportContinents: 1
//                 }
//             }
//         ]);

//         // Helper function to combine month-wise shipment data
//         const combineMonthWiseShipments = (monthWiseShipments) => {
//             const monthMap = new Map();
//             monthWiseShipments.forEach(({ month, count }) => {
//                 if (monthMap.has(month)) {
//                     monthMap.set(month, monthMap.get(month) + count);
//                 } else {
//                     monthMap.set(month, count);
//                 }
//             });
//             return Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }));
//         };

//         // Helper function to combine continent data and calculate top contributors
//         const combineTopExportContinents = (topExportContinents, totalFetchedData) => {
//             const continentMap = new Map();
//             topExportContinents.forEach(({ continent, count, countryOfDestination }) => {
//                 if (!continentMap.has(continent)) {
//                     continentMap.set(continent, { continent, count: 0, topContributors: new Map() });
//                 }
//                 const continentData = continentMap.get(continent);
//                 continentData.count += count;
//                 if (!continentData.topContributors.has(countryOfDestination)) {
//                     continentData.topContributors.set(countryOfDestination, 0);
//                 }
//                 continentData.topContributors.set(countryOfDestination, continentData.topContributors.get(countryOfDestination) + count);
//             });
//             return Array.from(continentMap.values()).map(({ continent, count, topContributors }) => ({
//                 continent,
//                 count,
//                 percentage: totalFetchedData > 0 ? ((count / totalFetchedData) * 100).toFixed(2) : '0.00',
//                 topContributors: Array.from(topContributors.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 5)
//             }));
//         };


//         // Calculate fetchedData and percentage for topExportContinents
//         const shipmentData = aggregatedData.map(data => {
//             const monthWiseShipments = combineMonthWiseShipments(data.monthWiseShipments).sort((a, b) => new Date(a.month) - new Date(b.month));
//             const fetchedData = calculateFetchedData(monthWiseShipments);
//             const topExportContinents = combineTopExportContinents(data.topExportContinents, fetchedData);

//             return {
//                 ritcCode: data.ritcCode,
//                 monthWiseShipments,
//                 fetchedData,
//                 topExportContinents
//             };
//         });

//         // Insert the aggregated data into ShipmentHSN collection
//         await ShipmentHSN.insertMany(shipmentData);

//         res.status(200).send({ message: 'Aggregation and insertion completed successfully.' });
//     } catch (error) {
//         console.error('Error aggregating and storing RITC data:', error);
//         res.status(500).send({ message: 'An error occurred during aggregation.' });
//     }
// });

// module.exports = aggregationRouter;

const express = require('express');
const ExportData = require('../models/exports'); // Assuming this is the model for ExportData
const Shipment = require('../models/shipment'); // Updated model for Shipment
const aggregationRouter = express.Router();

// Helper functions (existing)
const calculateFetchedData = (monthWiseShipments) => {
    return monthWiseShipments.reduce((total, shipment) => total + shipment.count, 0);
};

const getContinent = (country) => {
    return countryToContinent[country.toUpperCase()] || 'Unknown';
};

// POST endpoint to aggregate and store shipment data
aggregationRouter.post('/api/aggregateShipmentData', async (req, res) => {
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
                    chapterCode: {
                        $substr: ["$ritcCode", 0, 2]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        country: '$countryOfDestination',
                        month: '$month',
                        chapterCode: '$chapterCode',
                        pod: '$portOfDischarge'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.country',
                    monthWiseShipments: {
                        $push: {
                            month: '$_id.month',
                            count: '$count'
                        }
                    },
                    topExportPODs: {
                        $push: {
                            pod: '$_id.pod',
                            count: '$count'
                        }
                    },
                    chapterCodeCounts: {
                        $push: {
                            chapterCode: '$_id.chapterCode',
                            month: '$_id.month',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $project: {
                    country: '$_id',
                    monthWiseShipments: 1,
                    topExportPODs: 1,
                    chapterCodeCounts: 1
                }
            }
        ]);

        // Helper function to combine month-wise shipment data
        const combineMonthWiseShipments = (monthWiseShipments) => {
            const monthMap = new Map();
            monthWiseShipments.forEach(({ month, count }) => {
                if (monthMap.has(month)) {
                    monthMap.set(month, monthMap.get(month) + count);
                } else {
                    monthMap.set(month, count);
                }
            });
            return Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }));
        };

        // Helper function to combine POD data
        const combineTopExportPODs = (topExportPODs) => {
            const podMap = new Map();
            topExportPODs.forEach(({ pod, count }) => {
                if (podMap.has(pod)) {
                    podMap.set(pod, podMap.get(pod) + count);
                } else {
                    podMap.set(pod, count);
                }
            });
            return Array.from(podMap.entries()).map(([pod, count]) => ({ pod, count }));
        };

        // Calculate fetchedData and percentage for topExportPODs
        const shipmentData = aggregatedData.map(data => {
            const monthWiseShipments = combineMonthWiseShipments(data.monthWiseShipments).sort((a, b) => new Date(a.month) - new Date(b.month));
            const topExportPODs = combineTopExportPODs(data.topExportPODs);
            const fetchedData = calculateFetchedData(monthWiseShipments);
            const totalCount = topExportPODs.reduce((acc, pod) => acc + pod.count, 0);
            const topExportPODsWithPercentage = topExportPODs.map(pod => ({
                ...pod,
                percentage: totalCount > 0 ? ((pod.count / totalCount) * 100).toFixed(2) : '0.00'
            }));

            // Combine chapter code counts
            const chapterCodeCounts = data.chapterCodeCounts.reduce((acc, { chapterCode, month, count }) => {
                if (!acc[chapterCode]) {
                    acc[chapterCode] = {};
                }
                acc[chapterCode][month] = count;
                return acc;
            }, {});

            return {
                country: data.country,
                monthWiseShipments,
                chapterCodeCounts,
                fetchedData,
                topExportPODs: topExportPODsWithPercentage
            };
        });

        // Insert the aggregated data into Shipment collection
        await Shipment.insertMany(shipmentData);

        res.status(200).send({ message: 'Aggregation and insertion completed successfully.' });
    } catch (error) {
        console.error('Error aggregating and storing shipment data:', error);
        res.status(500).send({ message: 'An error occurred during aggregation.' });
    }
});

module.exports = aggregationRouter;
