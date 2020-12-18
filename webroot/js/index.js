var STATUS = [
    {id: '', value: '' , name: ''},
    {id: 'open', value: 'Open' , name: 'open'},
    {id: 'assess', value: 'Assess' , name: 'assess'},
    {id: 'inProgress', value: 'In Progress' , name: 'inProgress'},
    {id: 'codeReview', value: 'Code Review' , name: 'codeReview'},
    {id: 'unitTesting', value: 'Unit Testing' , name: 'unitTesting'},
    {id: 'fixed', value: 'Fixed' , name: 'fixed'},
    {id: 'readyForQATesting', value: 'Ready For QA Testing' , name: 'readyForQATesting'},
    {id: 'qaTesting', value: 'Quality Assurance Testing' , name: 'qaTesting'},
    {id: 'qaCompleted', value: 'Quality Assurance Completed' , name: 'qaCompleted'},
    {id: 'userAcceptanceTesting', value: 'User Acceptance Testing' , name: 'userAcceptanceTesting'},
    {id: 'readyToRelease', value: 'Ready To Release' , name: 'readyToRelease'},
    {id: 'resolved', value: 'Resolved' , name: 'resolved'},
    {id: 'notReproducible', value: 'Not reproducible' , name: 'notReproducible'},
    {id: 'willFixLater', value: 'Will fix later' , name: 'willFixLater'},
    {id: 'wontfix', value: 'Will not fix' , name: 'wontfix'},
    {id: 'invalid', value: 'Invalid' , name: 'invalid'}
]

var PRIORITY = [
  {id: '', value: '' , name: ''},
  {id: 80, value: '80' , name: 'High'},
  {id: 50, value: '50' , name: 'Medium'},
  {id: 25, value: '25' , name: 'Low'},
  {id: 0,  value: '0' ,  name: 'Wishlist'},
  {id: 90, value: '90' , name: 'Needs Triage'}
]

$(function() {


    var db = {
        loadData: function(filter) {
            return $.ajax({
                type: "GET",
                url: "tickets.json",
                data: filter
            }).then((data)=> {
                return data.returnData;
            });
        },

        insertItem: function(item) {
            return $.ajax({
                type: "POST",
                url: "tickets/add.json",
                data: item
            });
        },

        updateItem: function(item) {
            return $.ajax({
                type: "PUT",
                url: "tickets/edit.json",
                data: item
            });
        },

        deleteItem: function(item) {
            return $.ajax({
                type: "DELETE",
                url: "tickets/delete.json",
                data: item
            });
        }
    }
    var selectedItems = [];

    var selectItem = function(item) {
        selectedItems.push(item);
    };

    var selectAllItems = function(item) {
        selectedItems.push(item);
    };

    var unselectItem = function(item) {
        selectedItems = $.grep(selectedItems, function(i) {
            return i !== item;
        });
    };

    $("#all-tickets").jsGrid({
        height: "calc( 100% - 50px)",
        width: "100%",

        filtering: true,
        editing: true,
        sorting: true,
        paging: true,
        autoload: true,

        pageSize: 10,
        paging: true,
        loadIndication: true,
        pageButtonCount: 5,

        controller: db,
        rowClick: function(args) {
            console.log("sdf", args);
        },
        fields: [
            {
                headerTemplate: function() {
                    return $("<button>").attr("type", "button").text("All")
                            .on("click", function () {
                                selectAllItems();
                            });
                },
                itemTemplate: function(_, item) {
                    return $("<input>").attr("type", "checkbox")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () {
                                $(this).is(":checked") ? selectItem(item) : unselectItem(item);
                            });
                },
                align: "center",
                editing: false,
                width: 50

            },
            { name: 'id', title: "Id", type: "text", width: 30, editing: false},
            { name: 'name', title: 'Name', type: "text", width: 150 ,sorting: false},
            {name: 'description', title: 'Ticket Description', type: "text", width: 150, sorting: false},
            { name: 'status', title: 'Status', sorter: "STATUS", type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: STATUS, valueField: "id", textField: "value"
            },
            { name: 'priority', title: 'Priority', type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: PRIORITY, valueField: "id", textField: "name" },

            { type: "control", deleteButton: false}
        ]

    });
});

jsGrid.sortStrategies.STATUS = function(index1, index2) {
    var status1 = STATUS.findIndex(function(item){
                    return item.name == index1;
                    })
    var status2 = STATUS.findIndex(function(item){
                    return item.name == index2;
                  })
    return status1.localeCompare(status2);
};
