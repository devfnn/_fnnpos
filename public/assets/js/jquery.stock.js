
(function ($) {

  "use strict";
  
  var OptionManager = (function () {
    var objToReturn = {};

    var _options = null;
    var DEFAULT_OPTIONS = {
      currencySymbol: '$',
      classCartIcon: 'my-stock-icon',
      classCartBadge: 'my-stock-badge',
      classProductQuantity: 'my-product-quantity',
      classProductRemove: 'my-product-remove',
      classCheckoutCart: 'my-stock-checkout',
      affixCartIcon: true,
      showCheckoutModal: true,
      numberOfDecimals: 2,
      cartItems: null,
      clickOnAddToCart: function ($addTocart) {},
      afterAddOnCart: function (products, totalPrice, totalQuantity) {},
      clickOnCartIcon: function ($cartIcon, products, totalPrice, totalQuantity) {},
      checkoutCart: function (products, totalPrice, totalQuantity) {
        return false;
      },
      getDiscountPrice: function (products, totalPrice, totalQuantity) {
        return null;
      }
    };


    var loadOptions = function (customOptions) {
      _options = $.extend({}, DEFAULT_OPTIONS);
      if (typeof customOptions === 'object') {
        $.extend(_options, customOptions);
      }
    };
    var getOptions = function () {
      return _options;
    };

    objToReturn.loadOptions = loadOptions;
    objToReturn.getOptions = getOptions;
    return objToReturn;
  }());

  var MathHelper = (function () {
    var objToReturn = {};
    var getRoundedNumber = function (number) {
      if (isNaN(number)) {
        //throw new Error('โปรดระบุเป็นตัวเลขจำนวนเต็ม');
        number = 1 ;
      }
      number = number * 1 ;
      var options = OptionManager.getOptions();
      return number.toFixed(options.numberOfDecimals);
    };
    objToReturn.getRoundedNumber = getRoundedNumber;
    return objToReturn;
  }());

  var ProductManager = (function () {
    var objToReturn = {};

    /*
    PRIVATE
    */
    const STORAGE_NAME = "__Stock";
    localStorage[STORAGE_NAME] = localStorage[STORAGE_NAME] ? localStorage[STORAGE_NAME] : "";
    var getIndexOfProduct = function (id) {
      var productIndex = -1;
      var products = getAllProducts();
      $.each(products, function (index, value) {
        if (value.id == id) {
          productIndex = index;
          return;
        }
      });
      return productIndex;
    };
    var setAllProducts = function (products) {
      localStorage[STORAGE_NAME] = JSON.stringify(products);
    };
    var addProduct = function (id,name,quantity,price,qt,um,recvstatus,unitquantity,recvremark,image) {
      var products = getAllProducts();
      products.push({
        id:id,
        name:name,
        quantity:quantity,
        unitquantity:unitquantity,
        price:price,
        qt:qt,
        um:um,
        recvstatus:recvstatus,
        recvremark:recvremark,
        image:image
      });
      setAllProducts(products);
    };

    /*
    PUBLIC
    */
    var getAllProducts = function () {
      try {
        var products = JSON.parse(localStorage[STORAGE_NAME]);
        return products;
      } catch (e) {
        return [];
      }
    };
    var updatePoduct = function (id, quantity, increaseQuantity) {
      var productIndex = getIndexOfProduct(id);
      if (productIndex < 0) {
        return false;
      }
      var products = getAllProducts();
      if(increaseQuantity) {
        products[productIndex].quantity = products[productIndex].quantity * 1 + (typeof quantity === "undefined" ? 1 : quantity * 1);
      } else {
        products[productIndex].quantity = typeof quantity === "undefined" ? products[productIndex].quantity * 1 + 1 : quantity * 1;
      }
      setAllProducts(products);
      return true;
    };
    var setProduct = function (id,name,quantity,price,qt,um,recvstatus,recvremark,image,unitquantity) {
      if ( id == 'NaN' || id == '') {
        alert("โปรดกรอก  id!");
        console.error("id required");
        return false;
      }
      if (name == 'NaN' || name == '') {
        alert("โปรดกรอก  ชื่อสินค้า !");
        console.error("name required");
        return false;
      }
      if (price == 'NaN' || price == '') {
        alert("โปรดกรอก  ราคาสินค้า!");
        console.error("price required");
        return false;
      }
      if (quantity == 'NaN' || quantity == '') {
        console.error("quantity required");
        return false;
      }
      if (unitquantity == 'NaN' || unitquantity == '') {
        console.error("unitquantity required");
        return false;
      }
      

     
      // if (typeof image === "undefined") {
      //   console.error("image required");
      //   return false;
      // }
      if (!$.isNumeric(price)) {
        console.error("โปรดระบุเป็นตัวเลข");
        return false;
      }
      if (!$.isNumeric(quantity)) {
        console.error("โปรดระบุเป็นตัวเลข");
        return false;
      }
     // summary = typeof summary === "undefined" ? "" : summary;

      if (!updatePoduct(id, quantity, true)) {
        addProduct(id,name,unitquantity,quantity,price,qt,um,recvstatus,recvremark,image,unitquantity);
      }
    };
    
      var clearProduct = function () {
        setAllProducts([]);
      };
      var removeProduct = function (id) {
      var products = getAllProducts();
      products = $.grep(products, function (value, index) {
        return value.id != id;
      });
      setAllProducts(products);
    };
    var getTotalQuantity = function () {
      var total = 0;
      var products = getAllProducts();
      $.each(products, function (index, value) {
        total += value.quantity * 1;
      });
      return total;
    };
    var getTotalPrice = function () {
      var products = getAllProducts();
      var total = 0;
      $.each(products, function (index, value) {
        total += value.quantity * value.price;
        total = MathHelper.getRoundedNumber(total) * 1;
      });
      return total;
    };
    var clearcart = function () {
      var $cartClear = $("#" + idCartClear);
      $cartClear.empty();
      localStorage[STORAGE_NAME] = [];
      //$("#" + idCartModal).modal('show');
    };

    objToReturn.getAllProducts = getAllProducts;
    objToReturn.updatePoduct = updatePoduct;
    objToReturn.setProduct = setProduct;
    objToReturn.clearProduct = clearProduct;
    objToReturn.Clearcart = clearcart;
    objToReturn.removeProduct = removeProduct;
    objToReturn.getTotalQuantity = getTotalQuantity;
    objToReturn.getTotalPrice = getTotalPrice;
    return objToReturn;
  }());


  var loadMyCartEvent = function (targetSelector) {

    var options = OptionManager.getOptions();
    var $cartIcon = $("." + options.classCartIcon);
    var $cartBadge = $("." + options.classCartBadge);
    var classProductQuantity = options.classProductQuantity;
    var classProductRemove = options.classProductRemove;
    var classCheckoutCart = options.classCheckoutCart;

    var idCartModal = 'my-stock-modal';
    var idCartTable = 'my-stock-table';
    var idCartClear = 'my-stock-clear';
    var idGrandTotal = 'my-stock-grand-total';
    var idEmptyCartMessage = 'my-stock-empty-message';
    var idDiscountPrice = 'my-stock-discount-price';
    var classProductTotal = 'my-product-total';
    var classAffixMyCartIcon = 'my-stock-icon-affix';


    if (options.cartItems && options.cartItems.constructor === Array) {
      ProductManager.clearProduct();
      $.each(options.cartItems, function () {
        ProductManager.setProduct(this.id,this.name,this.quantity,this.unitquantity,this.price,this.qt,this.um,this.recvstatus,this.recvremark,this.image,this.unitquantity);
      });
    }

    $cartBadge.text(ProductManager.getTotalQuantity());
//  POP up Cart
    // if (!$("#" + idCartModal).length) {
    //   $('body').append(
    //     '<div class="modal fade" id="' + idCartModal + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
    //     '<div class="modal-dialog" role="document">' +
    //     '<div class="modal-content">' +
    //     '<div class="modal-header">' +
    //     '<button type="button" id="IDModal" class="close btn"  data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    //     '<h4 class="modal-title" id="myModalLabel"><span class="fas fa-shopping-cart"></span> My Cart</h4>' +
    //     '</div>' +
    //     '<div class="modal-body">' +
    //     '<table class="table table-hover table-responsive" id="' + idCartTable + '"></table>' +
    //     '</div>' +
    //     '<div class="modal-footer">' +
    //     '<button type="button" id="IDModal" class="btn btn-default " data-bs-dismiss="modal">Close</button>' +
    //     '<button type="button" class="btn btn-primary ' + classCheckoutCart + '">Checkout</button>' +
    //     '</div>' +
    //     '</div>' +
    //     '</div>' +
    //     '</div>'
    //   );
    // }

    var drawTable = function () {
      var $cartTable = $("#" + idCartTable);
      $cartTable.empty();
      $cartTable.append(
        '<thead>'+
          '<tr>'+
             ' <th>รหัสสินค้า</th>' +
             ' <th>ชื่อสินค้า</th> '+
             ' <th>ราคา/ชิ้น</th>'+
             ' <th>จำนวนแพ็ค</th>'+
             ' <th>จำนวนชิ้น/แพ็ค</th>'+
         //    ' <th>Salary</th>'+
              '</tr>'+
          '</thead>' 
      );
    // List Item In Cart
      var products = ProductManager.getAllProducts();
      $.each(products, function () {
        var total = this.quantity * this.price;
        $cartTable.append(
          
          '<tr title="' + this.summary + '" data-id="' + this.id +  '" data-name="' + this.name +  '" data-price="' + this.id + '" data-recvStatus="' + this.recvstatus + '" data-recvremark="' + this.recvremark   + '" data-um="' + this.um + '" data-qt="' +  this.qt +  ' "data-max="'+ this.stockin + '">' +
          '<td>' + this.id + '</td>' +
          '<td>' + this.name + '</td>' +
          '<td title=" Price" class="text-right">' + MathHelper.getRoundedNumber(this.price) + '</td>' +
          '<td title="unitQuantity">'+  MathHelper.getRoundedNumber(this.unitquantity) + ' </td>' +
          '<td title="Quantity">'+  MathHelper.getRoundedNumber(this.quantity) + ' </td>' +
          '<td title="Remove from Cart" class="text-center" style="width: 30px;"><a href="javascript:void(0);" class="btn btn-xs btn-danger ' + classProductRemove + '">X</a></td>' +
          '</tr>'
        );
      });
      //  Cal total and ck Is cart enpty
      $cartTable.append(products.length ?
         '<tr>' +
        // '<td></td>' +
       // '<td><strong>Total</strong></td>' +
        // '<td></td>' +
        // '<td></td>' +
        // '<td class="text-right"><strong id="' + idGrandTotal + '"></strong></td>' +
        // '<td></td>' +
        '</tr>' :
        '<tr>' +' <td colspan="5"> <div class="alert alert-danger" role="alert" style="text-align: center;" id="' + idEmptyCartMessage + '">ไม่มีสินค้าในรายการ</div>' + ' </td></tr>'
      );

      //  discount  price
      var discountPrice = options.getDiscountPrice(products, ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      // if (products.length && discountPrice !== null) {
      //   $cartTable.append(
      //     '<tr style="color: red">' +
      //     '<td></td>' +
      //    '<td><strong>Total (including discount)</strong></td>' +
      //     '<td></td>' +
      //     '<td></td>' +
      //     '<td class="text-right"><strong id="' + idDiscountPrice + '"></strong></td>' +
      //     '<td></td>' +
      //     '</tr>'
      //   );
      // }

     // showGrandTotal();
     // showDiscountPrice();
    };
    var showModal = function () {
      drawTable();
      //$("#" + idCartModal).modal('show');
    };
    
    var updateCart = function () {
      $.each($("." + classProductQuantity), function () {
        var id = $(this).closest("tr").data("id");

        ProductManager.updatePoduct(id, $(this).val());
      });
    };
    var showGrandTotal = function () {
      $("#" + idGrandTotal).text( MathHelper.getRoundedNumber(ProductManager.getTotalPrice()));
    };
    var showDiscountPrice = function () {
      $("#" + idDiscountPrice).text( MathHelper.getRoundedNumber(options.getDiscountPrice(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity())));
    };

    /*
    EVENT
    */
    if (options.affixCartIcon) {
      var cartIconBottom = $cartIcon.offset().top * 1 + $cartIcon.css("height").match(/\d+/) * 1;
      var cartIconPosition = $cartIcon.css('position');
      $(window).scroll(function () {
        $(window).scrollTop() >= cartIconBottom ? $cartIcon.addClass(classAffixMyCartIcon) : $cartIcon.removeClass(classAffixMyCartIcon);
      });
    }

    $cartIcon.click(function () {
      options.showCheckoutModal ? showModal() : options.clickOnCartIcon($cartIcon, ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
    });
    
    $(document).ready(function(){
      options.showCheckoutModal ? showModal() : options.clickOnCartIcon($cartIcon, ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
    
    });

    // $(document).on("input", "." + classProductQuantity, function () {
    //   var price = $(this).closest("tr").data("price");
    //   var id = $(this).closest("tr").data("id");
    //   var valuemax = $(this).closest("tr").data("max");
    //   var quantity = $(this).val();

    //   // ตั้งค่า ให้ใส่ตัวเลขได้ไม่เกินที่มี สต๊อกอยู่
    //   $(this).val(Math.min(valuemax, Math.max(1, $(this).val())));
    //   //$(this).val(Math.max(valuemax,$(this).val()));
    //   // console.log(id);
    //   // console.log(price);
    //   // console.log(valuemax);
    //   $(this).parent("td").next("." + classProductTotal).text( MathHelper.getRoundedNumber(price * quantity));
    //   ProductManager.updatePoduct(id, quantity);

    //   $cartBadge.text(ProductManager.getTotalQuantity());
    //   showGrandTotal();
    //   showDiscountPrice();
    // });

    $(document).on('keypress', "." + classProductQuantity, function (evt) {
      if (evt.keyCode >= 48 && evt.keyCode <= 57) {
        return;
      }
      evt.preventDefault();
    });

    $(document).on('click', "." + classProductRemove, function () {
      var $tr = $(this).closest("tr");
      var id = $tr.data("id");
      $tr.hide(500, function () {
        ProductManager.removeProduct(id);
        drawTable();
        $cartBadge.text(ProductManager.getTotalQuantity());
        
      });
    });

    $(document).on('click', "." + classCheckoutCart, function () {


                        var Shopcode=document.getElementsByName("shopcode")[0];
                        var Stocknumber=document.getElementsByName("stocknumber")[0];
                        var InvoidDate=document.getElementsByName("invoiddate")[0];
                        var Date=document.getElementsByName("date")[0];
                        console.log('shopcode ' + Shopcode.value);
                        if (Shopcode.value == 'NaN' || Shopcode.value == '' || Shopcode.value == 'undefined' || Shopcode.value == ' ') {
                            console.log("Shopcode required");
                            alert("โปรดกรอกรหัสลูกค้า!");
                            return false;
                        }
                        if (Stocknumber.value == 'NaN' || Stocknumber.value == '' || Stocknumber.value == 'undefined' || Stocknumber.value == ' ') {
                          console.log("Stocknumber required");
                          alert("โปรดกรอก  Stocknumber!");
                          return false;
                       }
                       if (InvoidDate.value == 'NaN' || InvoidDate.value == '' || InvoidDate.value == 'undefined' || InvoidDate.value == ' ') {
                        console.log("InvoidDate required");
                        alert("โปรดกรอก  InvoidDate!");
                        return false;
                     }
                     if (Date.value == 'NaN' || Date.value == '' || Date.value == 'undefined' || Date.value == ' ') {
                      console.log("Date required");
                      alert("โปรดกรอก  Date!");
                      return false;
                   }

      var products = ProductManager.getAllProducts();
      if (!products.length) {
        $("#" + idEmptyCartMessage).fadeTo('fast', 0.5).fadeTo('fast', 1.0);
        return;
      }
      updateCart();
      var isCheckedOut = options.checkoutCart(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      if (isCheckedOut !== false) {
        drawTable();
        ProductManager.clearProduct();
        $cartBadge.text(ProductManager.getTotalQuantity());
         
        var $cartTable = $("#" + idCartTable);
      $cartTable.empty();
      //  เคลีย ข้อมูลเมื่อ บันทึกรายการเรียบร้อย
      $cartTable.append(
        '<div class="alert alert-danger" role="alert" >บันทึกรายการเรียบร้อย</div>'
      );
       // $("#" + idCartModal).modal("hide");
      }
     
    });

    $(document).on('click', targetSelector, function () {

      
        //var combinedData = $("#product-form").serialize();
        //console.log(combinedData);
       
      var $target = $('.register-form');
      options.clickOnAddToCart($target);
     // var id = $('#product-id').val();
      var id = $("#product-id").val();
      
      // var id = $target.data('id');
      // console.log(id);
       var name =  $("#product-name").val();
       var unitquantity =  $("#unitquantity").val();
       var quantity =  $("#quantity").val();
       var price =  $("#unitprice").val();
       var qt = '';
       var um = '';
       //var price = '1';
       var recvstatus = '';
       var recvremark = '';
       var image = '';
      console.log( id + "    " + name + "   " + unitquantity + "   " + quantity);
      
     // var $cartTable = $("#" + idCartTable); 
      

      ProductManager.setProduct(id,name,quantity,unitquantity,price,qt,um,recvstatus,recvremark,image);
      $cartBadge.text(ProductManager.getTotalQuantity());

      options.afterAddOnCart(ProductManager.getAllProducts(), ProductManager.getTotalPrice(), ProductManager.getTotalQuantity());
      drawTable();
      
    });

  };
  

  $.fn.myCart = function (userOptions) {
    OptionManager.loadOptions(userOptions);
    loadMyCartEvent(this.selector);
    return this;
  };
  $.fn.loadCart = function (userOptions) {
    OptionManager.loadOptions(userOptions);
    loadMyCartEvent(this.selector);
    return this;
  };


})(jQuery);