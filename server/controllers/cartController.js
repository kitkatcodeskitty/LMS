import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// add to card for user
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, referralCode } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    const user = await User.findById(userId).select("firstName lastName email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const course = await Course.findById(courseId).select(
      "courseTitle courseDescription coursePrice courseThumbnail"
    );
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let userCart = await Cart.findOne({ "user._id": userId });

    if (!userCart) {
      userCart = new Cart({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        courses: [
          {
            course: {
              _id: course._id,
              courseTitle: course.courseTitle,
              courseDescription: course.courseDescription,
              coursePrice: course.coursePrice,
              courseThumbnail: course.courseThumbnail,
            },
            referralCode: referralCode || null,
          },
        ],
      });
    } else {
      const alreadyInCart = userCart.courses.some(
        (item) => item.course._id.toString() === courseId
      );

      if (alreadyInCart) {
        return res.status(400).json({ success: false, message: "Course already in cart" });
      }

      userCart.courses.push({
        course: {
          _id: course._id,
          courseTitle: course.courseTitle,
          courseDescription: course.courseDescription,
          coursePrice: course.coursePrice,
          courseThumbnail: course.courseThumbnail,
        },
        referralCode: referralCode || null,
      });
    }

    await userCart.save();
    res.status(200).json({ success: true, message: "Course added to cart", userCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// validate purchase for user it is like user get bought courses 

export const validatePurchase = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const userCart = await Cart.findOne({ "user._id": userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: "User cart not found" });
    }

    const courseItem = userCart.courses.find(
      (item) => item.course._id.toString() === courseId
    );

    if (!courseItem) {
      return res.status(404).json({ success: false, message: "Course not found in cart" });
    }

    courseItem.isValidated = true;

    const purchasingUser = await User.findById(userId);


    if (!purchasingUser.affiliateCode) {
      const generatedCode = purchasingUser._id.toString().slice(-6);
      purchasingUser.affiliateCode = generatedCode;
    }

    if (courseItem.referralCode) {
      const referrer = await User.findOne({ affiliateCode: courseItem.referralCode });

      if (referrer && referrer._id.toString() !== userId) {
        referrer.affiliateEarnings += courseItem.course.coursePrice / 2;


        if (!purchasingUser.referredBy) {
          purchasingUser.referredBy = courseItem.referralCode;
        }

        await referrer.save();
      }
    }

    await purchasingUser.save();
    await userCart.save();

    res.status(200).json({ success: true, message: "Course marked as purchased" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};







