if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/roshdi/.gradle/caches/8.13/transforms/da8ed453203b9ddc55937a8bab701534/transformed/hermes-android-250829098.0.14-release/prefab/modules/hermesvm/libs/android.armeabi-v7a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/roshdi/.gradle/caches/8.13/transforms/da8ed453203b9ddc55937a8bab701534/transformed/hermes-android-250829098.0.14-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

