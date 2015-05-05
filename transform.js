/////////////////////////////////////////////////////////////////////
//                                                                 //
// Node.js Script to transform our JSON data to be used            //
// for the D3 visualization in my portfolio                        //
//                                                                 //
/////////////////////////////////////////////////////////////////////
var fs = require('fs');
var util = require('util');
var _ = require('lodash');

// The json data will be read in synchronously, then parsed
var jsonData;
var jsonData = fs.readFileSync('./data/skills-data.json', 'UTF-8');
var parsedData = JSON.parse(jsonData);

// Parse the integers
parsedData.forEach(function(item) {
    item.topicScore = parseInt(item.topicScore, 10);
});


// The transformation function
function transformJSON(untransformed) {
    var transformed = [];
    var u; // For the untransformed item in the loop
    var t; // For the transformed item in the loop
    var detected = false; // A detection variable

    for(u = 0; u < untransformed.length; u++) {
// If the new transformed array contains data, this pushes the untransformed data into our new transformed array where we need it to go.
        if( u > 0) {
            for (t = 0; t < transformed.length; t++) {
// If the untransformed item's skillName equals the new transformed item's skillName, lets push topics from the untransformed into the transformed
                if (untransformed[u].skillName === transformed[t].skillName) {
                    transformed[t].topics.push({
                        topicName: untransformed[u].topicName,
                        topicScore: untransformed[u].topicScore
                    });
                    transformed[t].skillScore += untransformed[u].topicScore; // Calc average after
                    detected = true;
                }
            }
        }
        
 // If the new transformed array is empty, we create it with our desired structure. Then the next time around the loop, we will push data into it using the statement above.
        if(detected === false) {
            transformed.push({
                category: untransformed[u].category,
                skillName: untransformed[u].skillName,
                skillScore: untransformed[u].topicScore,
                topics: [{
                    topicName: untransformed[u].topicName,
                    topicScore: untransformed[u].topicScore
                }]
            });
        }
        
        detected = false;
    } // End Main For Loop
    
    // Perform the division for the final skillScore
    transformed.forEach(function(item) {
        item.skillScore = Math.round(item.skillScore / item.topics.length);
    });
    
    return transformed;
}


// Execute the transformation on our data
var transformedData = transformJSON(parsedData);

// Group the data by category using lodash, this is the final data for skills
var groupedData = _.groupBy(transformedData, function(item) {
    return item.category;
});


// Create the Category Data Rollup
var data = parsedData.filter(function(item) {
    return item.category === 'Data';
});

var design = parsedData.filter(function(item) {
    return item.category === 'Design';
});
var development = parsedData.filter(function(item) {
    return item.category === 'Development';
});

var seo = parsedData.filter(function(item) {
    return item.category === 'SEO';
});


// The size of the Category Bubbles are based on volume of skills calculated here
function getCategorySize(category) {
    var filterSkill = category.filter(function(item) {
        return item.skillName;
    });
    return filterSkill.length;
}

var dataScore = getCategorySize(data);
var designScore = getCategorySize(design);
var devScore = getCategorySize(development);
var seoScore = getCategorySize(seo);


// Create Our Category Data Object
var categoryData = {
    name: 'skills',
    children: [
      { name: 'Data',        size: dataScore,  color: '#66ccff' },
      { name: 'Design',      size: designScore,  color: '#99cc33' },
      { name: 'Development', size: devScore,  color: '#ff9933' },
      { name: 'SEO',         size: seoScore,   color: '#ff6666'  }
     ]
};

// Write the data to a new file
fs.writeFileSync('final-data.js',
    'var categoryData = ' + util.inspect(categoryData, { showHidden: false, depth: null }) + ';' + '\n \n' +
    'var skillData = ' + util.inspect(groupedData, { showHidden: false, depth: null }) + ';');